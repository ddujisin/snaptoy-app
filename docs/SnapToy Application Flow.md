# **Toy Background Changer App: A Simple User Guide**

Welcome to the Toy Background Changer app\! This document outlines the simple steps to create amazing new pictures of your favorite toys.

### **1\. Secure Sign-In**

To get started, you'll be prompted to sign in. The app uses **Sign in with Apple** for a fast and secure login experience. This ensures that your account is protected and you can access your profile and subscriptions with a single tap.

### **2\. Capture or Upload a Photo**

Once logged in, you'll be taken to the main screen. Here, you have two options to select a picture of your toy:

* **Take a New Photo:** Use your iPhone's camera to capture a new picture.  
* **Upload from Gallery:** Choose an existing photo from your camera roll.

This process is handled by the app's frontend (built with the **Expo framework**), which manages camera and gallery permissions on your device.

### **3\. Automatic Object Selection**

After you've selected a photo, the app's powerful on-device AI (**Executorch**) will automatically detect and select the main toy in the picture. A bounding box will appear around the object, and you'll be asked to confirm if the selection is correct. This ensures the app knows exactly what to keep in the final image.

### **4\. Choose a New Background**

With the toy selected, a menu will pop up asking what kind of background you want to add. You can choose from:

* **Cartoon:** A vibrant, illustrated background.  
* **Lego:** A world made entirely of Lego bricks.  
* **Photo:** A realistic new photographic background.

You can also enter a custom prompt to describe your perfect background, giving you creative control over the final image. This step is a collaboration between the app and the backend API, which helps format your request.

### **5\. AI Magic and Credit Usage**

When you confirm your background choice, the app sends your image and prompt to our secure backend server. This server, which uses the **Photoroom AI service**, performs the actual background removal and replacement.

Each successful photo transformation uses one of your photo credits. A small counter on the screen will keep you updated on your remaining credits. If there's an issue with the AI generation, you'll receive a clear error message.

### **6\. Review and Save**

Once the magic is done, the new image will be displayed on your screen. You can either:

* **Confirm:** If you love the new photo, you can save it to your camera roll or use standard iPhone sharing options to send it to friends or share on social media.  
* **Re-try:** If you're not happy with the result, you can use a new credit to try again with different settings.

### **7\. Manage Credits**

Your photo credits are deducted each time a new background is generated. A widget on the top left shows remaining balance and allows the user to click to purchase more.