import importlib.util,os,subprocess,tempfile,tarfile,json
from pathlib import Path
spec=importlib.util.spec_from_file_location("backup","scripts/private-backup.py")
b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
with tempfile.TemporaryDirectory() as tmp:
 r=Path(tmp);plain=r/"sample.tar";cipher=r/"sample.gpg";restored=r/"restored.tar"
 secret="synthetic-only-"+os.urandom(20).hex();sample=r/"sample.json";sample.write_text(json.dumps({"voice":"synthetic audio","balance":123,"user":"fake"}))
 with tarfile.open(plain,"w") as a:a.add(sample,arcname="sample.json")
 b.encrypt(plain,cipher,secret);assert b"synthetic audio" not in cipher.read_bytes()
 def decrypt(source,target,password):
  return subprocess.run(["gpg","--batch","--yes","--pinentry-mode","loopback","--passphrase-fd","0","--output",str(target),"--decrypt",str(source)],input=password.encode(),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode
 assert decrypt(cipher,restored,secret)==0
 assert b.digest(plain)==b.digest(restored)
 assert decrypt(cipher,r/"wrong","wrong-password")!=0
 data=bytearray(cipher.read_bytes());data[-12]^=1;(r/"bad.gpg").write_bytes(data)
 assert decrypt(r/"bad.gpg",r/"bad",secret)!=0
assert b.pg_env("postgresql://postgres.jruxafztuvenabqlzefz:dummy@aws-0-ap-south-1.pooler.supabase.com:5432/postgres")["PGSSLMODE"]=="require"
for url in ["postgresql://postgres.other:dummy@aws-0-ap-south-1.pooler.supabase.com:5432/postgres","postgresql://postgres:dummy@evil.example:5432/postgres","postgresql://postgres.jruxafztuvenabqlzefz:dummy@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"]:
 try:b.pg_env(url)
 except ValueError:pass
 else:raise AssertionError("Unsafe connection accepted")
assert "%20" in b.object_url("bucket","a b.jpg")
assert b.NoRedirect().redirect_request(None,None,None,None,None,None) is None
print("PASS: encrypted roundtrip, wrong password, corruption, project binding, URL encoding and redirect refusal; synthetic data only")

# Exercise the complete archive pipeline with fake database and media, no provider calls.
from unittest.mock import patch
from io import BytesIO
with tempfile.TemporaryDirectory() as tmp:
 old=os.getcwd();os.chdir(tmp)
 try:
  inventory={"buckets":[{"id":"test"}],"objects":[{"bucket":"test","name":"folder/audio.wav","updated":"synthetic","metadata":{"size":8}}]}
  def fake_pg(args,env,output):
   Path(output).write_bytes(b"fake-database" if args[0]=="pg_dump" else json.dumps(inventory).encode())
  class FakeOpener:
   def open(self,request,timeout):
    assert request.full_url.endswith("/test/folder/audio.wav")
    return BytesIO(b"FAKE-WAV")
  secrets={"STUDIO_BACKUP_DATABASE_URL":"postgresql://postgres.jruxafztuvenabqlzefz:dummy@aws-0-ap-south-1.pooler.supabase.com:5432/postgres","STUDIO_BACKUP_SERVICE_KEY":"synthetic-key","STUDIO_BACKUP_PASSWORD":"synthetic-password-of-30-characters"}
  with patch.dict(os.environ,secrets),patch.object(b,"postgres",fake_pg),patch.object(b.urllib.request,"build_opener",return_value=FakeOpener()):
   b.main()
  out=Path("private-backup-output")
  assert sorted(p.name for p in out.iterdir())==["APANAMai-private-backup.tar.gpg","SHA256SUMS"]
  result=Path("recovery.tar")
  assert decrypt(out/"APANAMai-private-backup.tar.gpg",result,secrets["STUDIO_BACKUP_PASSWORD"])==0
  with tarfile.open(result) as archive:
   manifest=json.load(archive.extractfile("manifest.json"))
   assert archive.extractfile("media/0.bin").read()==b"FAKE-WAV"
   assert manifest["storage"]["objects"][0]["name"]=="folder/audio.wav"
   assert manifest["storage"]["objects"][0]["sha256"]==b.hashlib.sha256(b"FAKE-WAV").hexdigest()
   assert archive.extractfile("database.dump").read()==b"fake-database"
 finally:os.chdir(old)
print("PASS: full synthetic database/media archive, manifest mapping and encrypted-only output")
