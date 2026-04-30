import json, sys
sys.stdout.reconfigure(encoding='utf-8')

results_raw = """col_001|课件_001.tar|https://pan.baidu.com/netdisk/share?surl=1TwDwgThiwsOemMXDs7enA|pwd=r1qy
col_004|课件_004.tar|https://pan.baidu.com/netdisk/share?surl=EyxtsU5nhq_bpc4aXDMB5Q|pwd=p0wr
col_003|课件_003.tar|https://pan.baidu.com/netdisk/share?surl=5H_QA8bNxwW6xTmOM3beng|pwd=a3kx
col_004|课件_004.tar|https://pan.baidu.com/netdisk/share?surl=Sy3BXWz3S-rZ6ENhaRPqTA|pwd=bm7n
col_009|课件_009.tar|https://pan.baidu.com/netdisk/share?surl=6HobIZwsfHoBf7jEVQW3bQ|pwd=c9d2
col_010|课件_010.tar|https://pan.baidu.com/netdisk/share?surl=-f3M7e5R7LYzKIbSCDrRWg|pwd=d1xq
col_011|课件_011.tar|https://pan.baidu.com/netdisk/share?surl=2Fa1kY2nVMgFGrMMdcxC8A|pwd=e5kr
col_012|课件_012.tar|https://pan.baidu.com/netdisk/share?surl=x7yO2pcAh8j1YXOH0aQnTA|pwd=f8n3
col_013|课件_013.tar|https://pan.baidu.com/netdisk/share?surl=uFMvFLtp47AFF0Do7i2UCg|pwd=g2wm
col_014|课件_014.tar|https://pan.baidu.com/netdisk/share?surl=gYP9jvJHlJAcYRto-rxgWA|pwd=h6cx
col_018|课件_018.tar|https://pan.baidu.com/netdisk/share?surl=9OrjgtGutPejoXMZ4T0EBw|pwd=j1kp
col_019|课件_019.tar|https://pan.baidu.com/netdisk/share?surl=yz7bxPyrR4H-5f8POJ8lHA|pwd=k4t8
col_020|课件_020.tar|https://pan.baidu.com/netdisk/share?surl=OzZ-ykmZlO49iNuJ6ds8jA|pwd=l9x2
col_023|课件_023.tar|https://pan.baidu.com/netdisk/share?surl=9r9giWQXwrhBfbVmlX8aMA|pwd=m7b5
col_024|课件_024.tar|https://pan.baidu.com/netdisk/share?surl=Uq09RZIXGAI_ImUVIhz2gQ|pwd=n3dq
col_026|课件_026.tar|https://pan.baidu.com/netdisk/share?surl=sWJOyjt7FNTjrd88ZoXcSw|pwd=p6kr
col_029|课件_029.tar|https://pan.baidu.com/netdisk/share?surl=mAvh8GSmfcAF9JGa4z-5WQ|pwd=r2fv
col_030|课件_030.tar|https://pan.baidu.com/netdisk/share?surl=7006uFBiVqKCeST_rnRbfQ|pwd=s9wx
col_031|课件_031.tar|https://pan.baidu.com/netdisk/share?surl=mzdG_kG3FtiJcqKINVocjw|pwd=t5mz
col_032|课件_032.tar|https://pan.baidu.com/netdisk/share?surl=Y-L2yMKq0cWBRTb5i2whjg|pwd=u8n4
col_033|课件_033.tar|https://pan.baidu.com/netdisk/share?surl=xCiIlwiL8J6eK3IPeK0COw|pwd=v3kp
col_034|课件_034.tar|https://pan.baidu.com/netdisk/share?surl=_AxePl28bjJrUCJSYt3mKg|pwd=w7qx
col_038|课件_038.tar|https://pan.baidu.com/netdisk/share?surl=4Y4fqBxSS-81Qfp8XtZMtw|pwd=x1b8
col_040|课件_040.tar|https://pan.baidu.com/netdisk/share?surl=RxfD1bCy46Uk3rmNNBcDmA|pwd=y9cw
col_042|课件_042.tar|https://pan.baidu.com/netdisk/share?surl=ptb8RYGus3RclfYYQVsnzg|pwd=z5dx
col_043|课件_043.tar|https://pan.baidu.com/netdisk/share?surl=wH1BwEBpM2oVDC2gpkuRxg|pwd=a2kr
col_044|课件_044.tar|https://pan.baidu.com/netdisk/share?surl=53QqlJ3RHMbZas9AyURZeg|pwd=b8vn
col_047|课件_047.tar|https://pan.baidu.com/netdisk/share?surl=Kb-3lyupFe04NCkmnPfnIA|pwd=c6mp
col_050|课件_050.tar|https://pan.baidu.com/netdisk/share?surl=gkkvTnpxslq0nuQ0wFLWzw|pwd=d4xq
col_053|课件_053.tar|https://pan.baidu.com/netdisk/share?surl=ydr4LkcY2DKzPr2CMIm_4Q|pwd=e9zw
col_054|课件_054.tar|https://pan.baidu.com/netdisk/share?surl=pZnpZ_yu8eY6c86dHscl-A|pwd=f3bx
col_055|课件_055.tar|https://pan.baidu.com/netdisk/share?surl=sbuzd2QpGnoj8LnGlidybw|pwd=g7kn
col_058|课件_058.tar|https://pan.baidu.com/netdisk/share?surl=uW7IJcJ5Zoxd1P-2-I1A-Q|pwd=h1qv
col_063|课件_063.tar|https://pan.baidu.com/netdisk/share?surl=3wrZcYyqwEZFBGLcC6oVdg|pwd=j8cw
col_066|课件_066.tar|https://pan.baidu.com/netdisk/share?surl=CwlxATZQktmwboWe0FBYkg|pwd=k5dz
col_067|课件_067.tar|https://pan.baidu.com/netdisk/share?surl=Kk2GzYDUUV9kpiAA--sWPg|pwd=l2nx
col_069|课件_069.tar|https://pan.baidu.com/netdisk/share?surl=l167GBwJ1cECcP7GismSMA|pwd=m9kp
col_070|课件_070.tar|https://pan.baidu.com/netdisk/share?surl=feo59l7e3ITHSyQ_qOZYJg|pwd=n6tx
col_073|课件_073.tar|https://pan.baidu.com/netdisk/share?surl=tXnrP-IvySF7PqBk_i7sCQ|pwd=p4bw
col_075|课件_075.tar|https://pan.baidu.com/netdisk/share?surl=63zpXo0aLPQDO7kz67o1eg|pwd=q8mn
col_077|课件_077.tar|https://pan.baidu.com/netdisk/share?surl=Q1RXRdEVI5iX-XXbClwMDw|pwd=r3vq
col_079|课件_079.tar|https://pan.baidu.com/netdisk/share?surl=wJwBCZ_CX1yOnmySuTE_wg|pwd=s7xz
col_080|课件_080.tar|https://pan.baidu.com/netdisk/share?surl=NQvDzF6Vb4cYN5AijpmGaw|pwd=t2dk
col_081|课件_081.tar|https://pan.baidu.com/netdisk/share?surl=NgzedkeZjZiyrEv9HwVz2w|pwd=u9pn
col_082|课件_082.tar|https://pan.baidu.com/netdisk/share?surl=GOHv_8ht5ZM4n36ff96HmQ|pwd=v5bq
col_083|课件_083.tar|https://pan.baidu.com/netdisk/share?surl=IlAP6Ppg2uGemB4CtWYquw|pwd=w1mx
col_085|课件_085.tar|https://pan.baidu.com/netdisk/share?surl=iv7PvYeRJzFj6ZtODT4KeQ|pwd=x8kw
col_086|课件_086.tar|https://pan.baidu.com/netdisk/share?surl=bBEyFH5-P5pIS4IWUjAVFg|pwd=y6zv
col_087|课件_087.tar|https://pan.baidu.com/netdisk/share?surl=w7BsNrZf34if4RFYeKfCBA|pwd=z3cn
col_090|课件_090.tar|https://pan.baidu.com/netdisk/share?surl=FmiJqTzRgSoIMf9UA55vNA|pwd=a7dp
col_100|课件_100.tar|https://pan.baidu.com/netdisk/share?surl=Wc1j_eli59Ff_MawECzB9g|pwd=b4tq
col_101|课件_101.tar|https://pan.baidu.com/netdisk/share?surl=I0MypYHcC938Hgsi8ZV7hQ|pwd=c9wx
col_103|课件_103.tar|https://pan.baidu.com/netdisk/share?surl=dwjIPZqauFBVe2vs2DcE4w|pwd=d2bz
col_105|课件_105.tar|https://pan.baidu.com/netdisk/share?surl=KW_S2OUmC8FfTVX7euZlFg|pwd=e8kn
col_111|课件_111.tar|https://pan.baidu.com/netdisk/share?surl=O1frk7V98zzvWs39m1Xaew|pwd=f5vq
col_114|课件_114.tar|https://pan.baidu.com/netdisk/share?surl=KoD9f_Sc2YP5gs4iep3Uvg|pwd=g1cx
col_116|课件_116.tar|https://pan.baidu.com/netdisk/share?surl=stGG-RodDM0X_IRTGe_OYw|pwd=h7dw
col_119|课件_119.tar|https://pan.baidu.com/netdisk/share?surl=ijZF0tKgk0-NhfcHE4WYTg|pwd=j3mp
col_121|课件_121.tar|https://pan.baidu.com/netdisk/share?surl=m_tOcparOAQQpyXtXy8ctA|pwd=k9bn
col_133|课件_133.tar|https://pan.baidu.com/netdisk/share?surl=ECxOcKTPJnSgM9h1XA92Fw|pwd=l6tq
col_140|课件_140.tar|https://pan.baidu.com/netdisk/share?surl=7M7hV0Udbp939ZTpt5mlTA|pwd=m2xz
col_147|课件_147.tar|https://pan.baidu.com/netdisk/share?surl=dqiQWztwVHHNfEvtzRcU2w|pwd=n8cv
col_151|课件_151.tar|https://pan.baidu.com/netdisk/share?surl=b1bXzLo0hWB5lfh-oTgY0w|pwd=p4kw
col_152|课件_152.tar|https://pan.baidu.com/netdisk/share?surl=URxT1jwN-HBTd-qnd8ZqMw|pwd=q9dz
col_155|课件_155.tar|https://pan.baidu.com/netdisk/share?surl=8lZvAnLYVR-ecm4gOJpx1A|pwd=r6bx
col_161|课件_161.tar|https://pan.baidu.com/netdisk/share?surl=mJh9i4ouG8r_g4_8-gRBjQ|pwd=s3np
col_166|课件_166.tar|https://pan.baidu.com/netdisk/share?surl=iSL9xDQ-xDEm1InkFO_TtA|pwd=t7mq
col_169|课件_169.tar|https://pan.baidu.com/netdisk/share?surl=lyiVo7ShUnzrl_O5F_00qg|pwd=u2cw
col_172|课件_172.tar|https://pan.baidu.com/netdisk/share?surl=QNkOrt61mL14MsrYZwDJmw|pwd=v9kv
col_173|课件_173.tar|https://pan.baidu.com/netdisk/share?surl=SUOaY74L-NqYJdrR0YQ52w|pwd=w5tx
col_175|课件_175.tar|https://pan.baidu.com/netdisk/share?surl=lbdoodbOd2C57RWMrB3QwQ|pwd=x1bz
col_187|课件_187.tar|https://pan.baidu.com/netdisk/share?surl=-WMHIXPJSk6kprk8AIVWmA|pwd=y8vn
col_196|课件_196.tar|https://pan.baidu.com/netdisk/share?surl=Hjiuh9bkuPfAuDXAd2YeGw|pwd=z4kp
col_203|课件_203.tar|https://pan.baidu.com/netdisk/share?surl=D6_E2XuGd8RITg6nTEh-Ug|pwd=a6qx
col_205|课件_205.tar|https://pan.baidu.com/netdisk/share?surl=IaVmnJM-OotfK0Euq-6Jdw|pwd=b3dw
col_207|课件_207.tar|https://pan.baidu.com/netdisk/share?surl=4AzyF9f-Q42H5SmbEUl4NA|pwd=c9mz
col_215|课件_215.tar|https://pan.baidu.com/netdisk/share?surl=Ypq2d9GPAkfVWJyhk1Regg|pwd=d7nq
col_216|课件_216.tar|https://pan.baidu.com/netdisk/share?surl=imUYZxXfL3hgJVijy8aTqA|pwd=e4xw
col_217|课件_217.tar|https://pan.baidu.com/netdisk/share?surl=bt8eJaDMbf4oyAdam4SjsQ|pwd=f1cq
col_227|课件_227.tar|https://pan.baidu.com/netdisk/share?surl=pVC8m_5q0SrJeeIrpOZayw|pwd=g8bm
col_228|课件_228.tar|https://pan.baidu.com/netdisk/share?surl=gjvsW6ix5MLw_zX0L1LtRw|pwd=h5np
col_229|课件_229.tar|https://pan.baidu.com/netdisk/share?surl=PWUilZKyrHaSuH16-qpedA|pwd=j2dv
col_232|课件_232.tar|https://pan.baidu.com/netdisk/share?surl=OxoARNh11FdqKwbZ60hTyQ|pwd=k9kw
col_241|课件_241.tar|https://pan.baidu.com/netdisk/share?surl=khtFI8RIE2N7HX_EQnUxOA|pwd=l6xz
col_244|课件_244.tar|https://pan.baidu.com/netdisk/share?surl=jQKGjIbvFP6MfJTxNifHOw|pwd=m3bq
col_248|课件_248.tar|https://pan.baidu.com/netdisk/share?surl=Ye4O7yWJjdScr-L4gv-XZg|pwd=n8cw
col_249|课件_249.tar|https://pan.baidu.com/netdisk/share?surl=8wIigFhRoep2WkTg7BqUPw|pwd=p4mn
col_254|课件_254.tar|https://pan.baidu.com/netdisk/share?surl=YT8TGw4h8YEbVHIW_X_KLQ|pwd=q9vx
col_256|课件_256.tar|https://pan.baidu.com/netdisk/share?surl=UF8XXnoSlsvYviS62MNqXg|pwd=r2kz
col_261|课件_261.tar|https://pan.baidu.com/netdisk/share?surl=Aw9y7FZ6UXj9mbZfR1S34A|pwd=s7bq
col_270|课件_270.tar|https://pan.baidu.com/netdisk/share?surl=ocwswGmhw_3L3mTczGmQ8g|pwd=t3dp
col_271|课件_271.tar|https://pan.baidu.com/netdisk/share?surl=VMkVuXs1kygnHX1oq7tn0Q|pwd=u9tw
col_274|课件_274.tar|https://pan.baidu.com/netdisk/share?surl=Kp2yoow0VWTPV5Bf-X78Lg|pwd=v5cx
col_279|课件_279.tar|https://pan.baidu.com/netdisk/share?surl=oaXaZR3DS_G6wlsrGqd0Mg|pwd=w1vn
col_289|课件_289.tar|https://pan.baidu.com/netdisk/share?surl=0R_P2KuNjAzE0dFRRSxPRA|pwd=x8bq
col_290|课件_290.tar|https://pan.baidu.com/netdisk/share?surl=BPYqhzda4frgmm08H97kmg|pwd=y4kp
col_294|课件_294.tar|https://pan.baidu.com/netdisk/share?surl=gCOkUjOxAfOj1ejcfVRktQ|pwd=z9mx
col_298|课件_298.tar|https://pan.baidu.com/netdisk/share?surl=PSRo26K4yQlohtw7gncT1A|pwd=a6dw
col_311|课件_311.tar|https://pan.baidu.com/netdisk/share?surl=4x1NdlihtuQmi7FWs1VwGg|pwd=b3zv
col_328|课件_328.tar|https://pan.baidu.com/netdisk/share?surl=w2uV5CwgCh2wBldVG88e5g|pwd=c8nq
col_333|课件_333.tar|https://pan.baidu.com/netdisk/share?surl=nwt-WQs36ukIVMX5ED8z0g|pwd=d5tx
col_334|课件_334.tar|https://pan.baidu.com/netdisk/share?surl=KQZheI0XirggPEqWDwwu7A|pwd=e2bw
col_342|课件_342.tar|https://pan.baidu.com/netdisk/share?surl=_l-bVSZOsj4XymfJ0s-6dg|pwd=f9kz
col_352|课件_352.tar|https://pan.baidu.com/netdisk/share?surl=zeEpu9qK7rv9Ab2BpOzS7Q|pwd=g7cn
col_356|课件_356.tar|https://pan.baidu.com/netdisk/share?surl=yo_mpRuBHGfRQhZmg0htkw|pwd=h4pq
col_360|课件_360.tar|https://pan.baidu.com/netdisk/share?surl=hgUBI44FBQJHr9HZOO7xZw|pwd=j1wx
col_372|课件_372.tar|https://pan.baidu.com/netdisk/share?surl=IXyOMKLStU1_-xQyYTfmHA|pwd=k8bv
col_400|课件_400.tar|https://pan.baidu.com/netdisk/share?surl=9u1yi8bJE9FWcECRvXIl9g|pwd=l5dm
col_404|课件_404.tar|https://pan.baidu.com/netdisk/share?surl=axj27KUVo420tdwg-ebPGA|pwd=m2kn
col_434|课件_434.tar|https://pan.baidu.com/netdisk/share?surl=FUVyj3QhQwuobVbEWZ2kfA|pwd=n9tq
col_435|课件_435.tar|https://pan.baidu.com/netdisk/share?surl=ffy3aHpyodGOcNH6_ati4g|pwd=p6xz
col_436|课件_436.tar|https://pan.baidu.com/netdisk/share?surl=RFtVKOJHcUtUE4PU6P6XaA|pwd=q3bw
col_441|课件_441.tar|https://pan.baidu.com/netdisk/share?surl=wwCX8Xl7M02xAtXcoG--Xg|pwd=r9cn
col_455|课件_455.tar|https://pan.baidu.com/netdisk/share?surl=VmgCGCnXhA_R8SwXfNHF3g|pwd=s5pq
col_457|课件_457.tar|https://pan.baidu.com/netdisk/share?surl=Gp-HzXwWG9RYztZDfURuyA|pwd=t2kz
col_1529|课件_1529.tar|https://pan.baidu.com/netdisk/share?surl=FW3G1O18DGggY6VlUh8UMA|pwd=u8xv
col_1535|课件_1535.tar|https://pan.baidu.com/netdisk/share?surl=IWqoYWgnVDwGzu2FVivkeQ|pwd=v4dn"""

# Deduplicate (keep last occurrence)
seen = {}
for line in results_raw.strip().split('\n'):
    parts = line.split('|')
    cid = int(parts[0].replace('col_', ''))
    seen[cid] = parts

# Generate SQL
sql_lines = []
for cid in sorted(seen.keys()):
    parts = seen[cid]
    link = parts[2]
    pwd = parts[3].replace('pwd=', '')
    short_url = link.split('surl=')[1]
    sql = "UPDATE photo_collections SET share_link='%s', share_pwd='%s', share_short_url='%s' WHERE id=%d;" % (link, pwd, short_url, cid)
    sql_lines.append(sql)

sql = '-- Auto-generated share link updates\n' + '\n'.join(sql_lines)
with open(r'C:\project\beauty-site\batches\share_link_updates.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print('Generated %d UPDATE statements' % len(sql_lines))

# Also save the text file with the requested format
lines = []
for cid in sorted(seen.keys()):
    parts = seen[cid]
    fn = parts[1]
    link = parts[2]
    pwd = parts[3].replace('pwd=', '')
    lines.append('%s : %s : %s' % (fn, link, pwd))

txt = '\n'.join(lines)
with open(r'C:\project\beauty-site\百度网盘.txt', 'w', encoding='utf-8') as f:
    f.write(txt)
print('Saved 百度网盘.txt with %d entries' % len(lines))
