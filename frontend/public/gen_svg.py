import base64
with open('logo-horizontal.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220" width="100%" height="100%">
  <image width="900" height="220" href="data:image/png;base64,{b64}"/>
</svg>'''
with open('logo.svg', 'w') as f:
    f.write(svg)
