"""Mirror authored static assets into the Sites output directory."""
from pathlib import Path
from shutil import copy2, copytree, rmtree
root=Path(__file__).resolve().parents[1]
output=root/'dist'
if output.exists():
    rmtree(output)
output.mkdir()
for name in ['index.html','model.html','scout.html','payments.html','privacy.html','404.html','robots.txt','sitemap.xml']:
    copy2(root/name,output/name)
copytree(root/'assets',output/'assets')
print('Static output prepared.')
