import cv2
import numpy as np
import sys
import json

def analyze_image(image_path):
    try:
        # 1. Load the image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image")

        # Resize for faster processing
        height, width = img.shape[:2]
        img = cv2.resize(img, (800, int(800 * (height / width))))
        
        # 2. Find the 1 Rupee Coin (Calibration) using Hough Circles
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.medianBlur(gray, 5)
        
        circles = cv2.HoughCircles(blurred, cv2.HOUGH_GRADIENT, 1, 50,
                                  param1=50, param2=30, minRadius=20, maxRadius=150)
        
        if circles is None:
            return json.dumps({"error": "No coin detected for calibration."})

        # Assume the strongest circle is the coin
        circles = np.uint16(np.around(circles))
        coin = circles[0, 0]
        coin_radius_pixels = coin[2]
        coin_diameter_pixels = coin_radius_pixels * 2

        # A standard 1 Rupee coin is exactly 25mm
        # pixels_per_metric = how many pixels equal 1 millimeter
        pixels_per_metric = coin_diameter_pixels / 25.0

        # 3. Find the Mantoux Skin Reaction (The Red Bump)
        # Convert to HSV color space to easily isolate the color "Red"
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Red has two ranges in HSV
        lower_red1 = np.array([0, 50, 50])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 50, 50])
        upper_red2 = np.array([180, 255, 255])
        
        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        red_mask = mask1 + mask2

        # Clean up the mask
        kernel = np.ones((5,5), np.uint8)
        red_mask = cv2.morphologyEx(red_mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours of the red areas
        contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return json.dumps({"error": "Coin found, but no red skin reaction detected."})

        # Assume the largest red blob is the Mantoux reaction
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Get the bounding box of the bump
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Calculate the real-world size in millimeters!
        bump_width_mm = w / pixels_per_metric
        
        return json.dumps({
            "success": True,
            "coin_pixels": int(coin_diameter_pixels),
            "bump_mm": round(bump_width_mm, 1)
        })

    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    result = analyze_image(sys.argv[1])
    print(result)