"""Archive tracked source only, with a checksum and commit identity."""
import hashlib,json,subprocess,sys
from pathlib import Path
out=Path(sys.argv[1] if len(sys.argv)>1 else 'source-backup-output')
out.mkdir(parents=True,exist_ok=True)
sha=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
archive=out/'APANAMai-source.tar.gz'
subprocess.run(['git','archive','--format=tar.gz','--output',str(archive.resolve()),sha],check=True)
metadata={'format':'apanam-source-backup','version':1,'commit':sha,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'archive':archive.name,'scope':'Git-tracked source only; no database, user media, provider secrets or signing keys'}
(out/'backup-manifest.json').write_text(json.dumps(metadata,indent=2)+'\n')
print('Source backup created for commit '+sha)
