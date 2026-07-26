import cv2
import numpy as np
from PIL import Image

# Read the image
# Since the image might have a white background instead of transparent, let's handle both.
image_path = r"C:\Users\varsh\.gemini\antigravity\brain\64e73743-2a32-4d5e-8d65-6d86c00d4d1d\media__1784286113376.png"

# Read with Pillow to handle alpha properly
img = Image.open(image_path).convert("RGBA")
data = np.array(img)

# If the background is white, we should convert white pixels to transparent.
# Let's find white-ish pixels and make them transparent.
# White is [255, 255, 255, 255]
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
white_mask = (r > 240) & (g > 240) & (b > 240)
data[white_mask, 3] = 0 # set alpha to 0

# Now find the bounding box of non-transparent pixels
# alpha > 0
non_empty_columns = np.where(data[:,:,3].max(axis=0) > 0)[0]
non_empty_rows = np.where(data[:,:,3].max(axis=1) > 0)[0]

if len(non_empty_columns) > 0 and len(non_empty_rows) > 0:
    cropBox = (min(non_empty_columns), min(non_empty_rows), max(non_empty_columns), max(non_empty_rows))
    cropped = img.crop(cropBox)
    
    # Let's crop it even tighter because there might be some artifacts
    cropped_data = np.array(cropped)
    # recalculate alpha after making pure white transparent
    r2, g2, b2, a2 = cropped_data[:,:,0], cropped_data[:,:,1], cropped_data[:,:,2], cropped_data[:,:,3]
    white_mask2 = (r2 > 230) & (g2 > 230) & (b2 > 230)
    cropped_data[white_mask2, 3] = 0
    
    cropped = Image.fromarray(cropped_data)
    cropped.save("logo-horizontal.png", "PNG")
    
    # For icon, we'll crop just the left part. The "N" shape is on the left.
    # We can guess it takes up roughly the first 1/3rd of the width.
    width, height = cropped.size
    # Let's crop a square from the left
    icon_box = (0, 0, min(width, height + int(height*0.2)), height)
    icon = cropped.crop(icon_box)
    
    # Find bounding box of icon
    icon_data = np.array(icon)
    icon_non_empty_columns = np.where(icon_data[:,:,3].max(axis=0) > 0)[0]
    icon_non_empty_rows = np.where(icon_data[:,:,3].max(axis=1) > 0)[0]
    if len(icon_non_empty_columns) > 0 and len(icon_non_empty_rows) > 0:
        icon_cropBox = (min(icon_non_empty_columns), min(icon_non_empty_rows), max(icon_non_empty_columns), max(icon_non_empty_rows))
        icon = icon.crop(icon_cropBox)
    
    # resize to 512x512
    icon = icon.resize((512, 512), Image.Resampling.LANCZOS)
    icon.save("logo-icon.png", "PNG")
    print("SUCCESS")
else:
    print("FAILED TO CROP")
