# Copy any orange PNG image and rename to:
# icon.png, favicon.png, splash.png, adaptive-icon.png
# OR run this one-liner:
python3 -c "
import struct,zlib
def png(w,h,r,g,b):
    raw=b''.join(b'\x00'+bytes([r,g,b,255]*w) for _ in range(h))
    def ck(n,d): c=zlib.crc32(n+d)&0xffffffff; return struct.pack('>I',len(d))+n+d+struct.pack('>I',c)
    return b'\x89PNG\r\n\x1a\n'+ck(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))+ck(b'IDAT',zlib.compress(raw))+ck(b'IEND',b'')
for name,w,h in [('icon',64,64),('favicon',48,48),('splash',64,64),('adaptive-icon',64,64)]:
    open(f'assets/{name}.png','wb').write(png(w,h,249,115,22))
print('Assets created!')
"