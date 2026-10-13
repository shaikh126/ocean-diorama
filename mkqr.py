import sys,qrcode
from PIL import Image,ImageDraw,ImageFont
q=qrcode.make(sys.argv[1],box_size=30,border=2).convert('RGB');w,h=q.size
c=Image.new('RGB',(w,h+220),'white');c.paste(q,(0,0));d=ImageDraw.Draw(c)
try:f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',110)
except:f=ImageFont.load_default()
d.text((w//2,h+100),'Scan to dive in!',fill='#0077b6',font=f,anchor='mm');c.save('qr.png')
