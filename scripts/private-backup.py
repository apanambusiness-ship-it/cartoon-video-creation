"""Owner-operated encrypted backup; never restores production."""
import hashlib,json,os,subprocess,tempfile,urllib.parse,urllib.request,tarfile
from pathlib import Path
PROJECT="jruxafztuvenabqlzefz"
QUERY="""select json_build_object('buckets',(select coalesce(json_agg(row_to_json(b)),'[]'::json) from storage.buckets b),'objects',(select coalesce(json_agg(json_build_object('bucket',bucket_id,'name',name,'updated',updated_at,'metadata',metadata) order by bucket_id,name),'[]'::json) from storage.objects));"""
def digest(path):
 h=hashlib.sha256()
 with open(path,"rb") as f:
  for block in iter(lambda:f.read(1048576),b""):h.update(block)
 return h.hexdigest()
def encrypt(source,target,password):
 if len(password)<24:raise ValueError("Use an independent backup password of at least 24 characters")
 subprocess.run(["gpg","--batch","--yes","--pinentry-mode","loopback","--passphrase-fd","0","--symmetric","--cipher-algo","AES256","--output",str(target),str(source)],input=password.encode(),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=True)
def pg_env(connection):
 u=urllib.parse.urlsplit(connection)
 if u.scheme not in ("postgres","postgresql") or not u.hostname or not u.username or not u.password:raise ValueError("Invalid connection")
 if u.port!=5432 or not u.hostname.endswith((".supabase.co",".supabase.com")):raise ValueError("Use a Studio direct or session-pooler connection on port 5432")
 if PROJECT not in (u.hostname.split(".")[1] if u.hostname.startswith("db.") else "",u.username.split(".")[-1]):raise ValueError("Wrong project")
 return dict(PGHOST=u.hostname,PGPORT="5432",PGUSER=urllib.parse.unquote(u.username),PGPASSWORD=urllib.parse.unquote(u.password),PGDATABASE=urllib.parse.unquote(u.path.lstrip("/") or "postgres"),PGSSLMODE="require")
def postgres(args,env,output):
 command=["docker","run","--rm"]
 for key in env:command+=["--env",key]
 command+=["postgres:17"]+args
 with open(output,"wb") as f:subprocess.run(command,env={**os.environ,**env},stdout=f,stderr=subprocess.PIPE,check=True,timeout=1200)
def object_url(bucket,name):
 return "https://"+PROJECT+".supabase.co/storage/v1/object/"+urllib.parse.quote(bucket,safe="")+"/"+urllib.parse.quote(name,safe="/")
class BackupFailure(Exception):pass
def database_error(raw):
 text=raw.decode("utf-8",errors="replace").lower()
 for phrase,label in [
  ("password authentication failed","DATABASE_PASSWORD_REJECTED"),
  ("tenant or user not found","DATABASE_USER_OR_PROJECT_INVALID"),
  ("permission denied","DATABASE_PERMISSION_DENIED"),
  ("server version mismatch","DATABASE_CLIENT_VERSION_MISMATCH"),
  ("could not translate host name","DATABASE_HOST_NOT_FOUND"),
  ("connection refused","DATABASE_CONNECTION_REFUSED"),
  ("timeout","DATABASE_CONNECTION_TIMEOUT"),
  ("network is unreachable","DATABASE_NETWORK_UNREACHABLE")]:
  if phrase in text:return label
 return "DATABASE_DUMP_OR_CONNECTION_FAILED"
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
def main():
 required=["STUDIO_BACKUP_DATABASE_URL","STUDIO_BACKUP_SERVICE_KEY","STUDIO_BACKUP_PASSWORD"]
 if any(not os.environ.get(k) for k in required):raise ValueError("Configure the three Actions secrets")
 password=os.environ["STUDIO_BACKUP_PASSWORD"]
 if len(password)<24:raise ValueError("Weak backup password")
 env=pg_env(os.environ["STUDIO_BACKUP_DATABASE_URL"])
 output=Path("private-backup-output");output.mkdir(exist_ok=True)
 with tempfile.TemporaryDirectory(prefix="studio-private-") as tmp:
  root=Path(tmp);os.chmod(root,0o700)
  postgres(["pg_dump","--format=custom","--no-owner"],env,root/"database.dump")
  postgres(["psql","-X","-q","-t","-A","-c",QUERY],env,root/"storage-inventory.json")
  inventory=json.loads((root/"storage-inventory.json").read_text());objects=inventory["objects"]
  if len(objects)>5000:raise ValueError("Media count exceeds backup safety limit")
  media=root/"media";media.mkdir();total=0
  for i,item in enumerate(objects):
   request=urllib.request.Request(object_url(item["bucket"],item["name"]),headers={"apikey":os.environ["STUDIO_BACKUP_SERVICE_KEY"],"Authorization":"Bearer "+os.environ["STUDIO_BACKUP_SERVICE_KEY"]})
   path=media/(str(i)+".bin");size=0
   opener=urllib.request.build_opener(NoRedirect)
   with opener.open(request,timeout=90) as response,open(path,"wb") as f:
    while True:
     block=response.read(1048576)
     if not block:break
     size+=len(block);total+=len(block)
     if total>1073741824:raise ValueError("Media exceeds 1 GiB safety limit")
     f.write(block)
   expected=(item.get("metadata") or {}).get("size")
   if expected is not None and size!=int(expected):raise ValueError("Media size changed")
   item.update(file="media/"+path.name,sha256=digest(path),bytes=size)
  postgres(["psql","-X","-q","-t","-A","-c",QUERY],env,root/"storage-after.json")
  if json.loads((root/"storage-inventory.json").read_text())!=json.loads((root/"storage-after.json").read_text()):raise ValueError("Storage changed during backup")
  manifest={"format":"apanam-private-backup","version":1,"project":PROJECT,"database_sha256":digest(root/"database.dump"),"storage":inventory,"excludes":["provider secrets","custom-role passwords","Android signing keys","device-only drafts"],"consistency":"Database snapshot and storage inventory are separate, not one atomic cross-service snapshot"}
  (root/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False))
  bundle=root/"bundle.tar"
  with tarfile.open(bundle,"w") as archive:
   for name in ["database.dump","storage-inventory.json","manifest.json","media"]:archive.add(root/name,arcname=name)
  target=output/"APANAMai-private-backup.tar.gpg";encrypt(bundle,target,password)
  (output/"SHA256SUMS").write_text(digest(target)+"  "+target.name+"\n")
 print("Encrypted backup created; temporary plaintext removed.")
if __name__=="__main__":
 try:main()
 except Exception as error:
  if isinstance(error,subprocess.CalledProcessError):
   reason=database_error(error.stderr or b"") if error.cmd and error.cmd[0]=="docker" else "ENCRYPTION_FAILED"
  elif isinstance(error,subprocess.TimeoutExpired):reason="DATABASE_OPERATION_TIMEOUT"
  elif isinstance(error,urllib.error.HTTPError):reason="STORAGE_HTTP_"+str(error.code)
  elif isinstance(error,urllib.error.URLError):reason="STORAGE_NETWORK_FAILED"
  elif isinstance(error,ValueError):
   safe={"Configure the three Actions secrets","Weak backup password","Invalid connection","Use a Studio direct or session-pooler connection on port 5432","Wrong project","Media count exceeds backup safety limit","Media exceeds 1 GiB safety limit","Media size changed","Storage changed during backup"}
   reason=str(error) if str(error) in safe else "BACKUP_CONFIGURATION_OR_DATA_INVALID"
  else:reason="BACKUP_INTERNAL_ERROR"
  print("Backup failed: "+reason+". No complete backup uploaded.")
  raise SystemExit(1)
