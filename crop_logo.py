from PIL import Image
import os

img_path = r"C:\Users\Aditya\.gemini\antigravity-ide\brain\f9e72bff-c2c7-49ba-9be2-4c4a6a7385f5\.user_uploaded\media_1791622562586.jpg"
out_dir = r"d:\EcoSense-main\terrasense\public"
out_dir_assets = r"d:\EcoSense-main\terrasense\src\assets"

img = Image.open(img_path)

# Let's crop the center circle (Globe and Leaf). 
# Assuming standard layout, we can do a center crop.
width, height = img.size

# Let's extract the globe icon (approximate crop)
# Left: 20%, Top: 10%, Right: 80%, Bottom: 60%
icon_crop = img.crop((int(width*0.25), int(height*0.05), int(width*0.75), int(height*0.60)))
icon_crop.save(os.path.join(out_dir, "favicon.png"))
icon_crop.save(os.path.join(out_dir_assets, "logo-icon.png"))

# Full logo crop (including text)
full_crop = img.crop((int(width*0.1), int(height*0.05), int(width*0.9), int(height*0.9)))
full_crop.save(os.path.join(out_dir_assets, "logo-full.png"))

print("Cropped successfully!")
