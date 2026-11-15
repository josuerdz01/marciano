"""Prepare official, unsmoothed GRS thorium. No execution of the uploaded converter."""
import hashlib,json,urllib.request,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
base='https://pds-geosciences.wustl.edu/ody/ody-m-grs-5-elements-v1/odgm_xxxx/data/unsmoothed/5x5/'
raw=urllib.request.urlopen(base+'th_5x5.tab').read()
label=urllib.request.urlopen(base+'th_5x5.lbl').read()
assert b'WEIGHT PERCENT' in label and b'PRODUCT_VERSION_ID             = "2.0"' in label
rows=[list(map(float,line.split())) for line in raw.decode('ascii').splitlines() if line.strip()]
assert len(rows)==2592 and all(len(r)==5 for r in rows)
cells=[None]*2592
for lat,lon,value,sigma,cfs in rows:
    signed=(lon+180)%360-180
    r=round((87.5-lat)/5);c=round((signed+177.5)/5)
    assert 0<=r<36 and 0<=c<72 and cells[r*72+c] is None
    def ppm(v): return None if abs(v)>=9999 else round(v*10000,6)
    cells[r*72+c]=[ppm(value),ppm(sigma),ppm(cfs)]
assert all(c is not None for c in cells)
out={'product':'TH_5X5','version':'2.0','source':base+'th_5x5.tab','label':base+'th_5x5.lbl','catalog':'https://pds-geosciences.wustl.edu/missions/odyssey/grs_elements.html','sourceSha256':hashlib.sha256(raw).hexdigest(),'width':72,'height':36,'west':-180,'north':90,'step':5,'units':'ppm','period':'2002-06-04 / 2005-04-03','columns':['concentration','sigma','sigmaWithCfs'],'note':'Concentration, not radiation dose. Negative background-subtracted estimates retained. NoData is null. No smoothing.','cells':cells}
(root/'public/data/thorium-grs.json').write_text(json.dumps(out,separators=(',',':'))+'\n')
(root/'public/data/thorium-grs.lbl').write_bytes(label)
print('Prepared',len(cells),'official bins; ppm, no interpolation')
