import json,sys
sys.path.insert(0,'data/evidence-build')
from part1 import D
from part2 import D2
from part3 import D3
D.update(D2); D.update(D3)
assert len(D)==21, len(D)
for id,v in D.items():
    f=f'data/profiles/{id}.json'; P=json.load(open(f))
    P['sources']=P['sources']+[s for s in v['add_sources'] if s not in P['sources']]
    P['evidence']=v['evidence']
    P['zones']={z:{'fx':a[0],'ev':a[1],'why':a[2]} for z,a in v['zones'].items()}
    P['advantage']['ev']=v['adv_ev']
    P['balance']=P.get('balance',{'comp':0})
    P['look']=v['look']
    json.dump(P,open(f,'w'),indent=1,ensure_ascii=False)
print('applied')
