Welcome to BannerCraft!
Welcome to the official user manual for BannerCraft, a powerful tool designed for creating dynamic, animated web banners with ease. This guide will walk you through every feature, from creating your first asset to exporting the final code.

1. The Interface: A Quick Overview
   The BannerCraft interface is split into two main sections: the Left Panel for settings and management, and the Right Panel for visual creation and asset control.

Left Panel: This is your control center. Here you'll find global settings, the layers panel for organizing your elements, and the generated code output.

Right Panel: This is your creative canvas. It contains the live preview of your banner, animation controls, the alignment toolbar, and detailed property panels for every image and text element you add.

2. Getting Started: Your First Banner
   Let's create a simple banner in just a few steps.

Set Your Banner Size: In the Global Settings on the left, enter your desired dimensions (e.g., Width: 300, Height: 250).

Add an Asset: In the Banner Assets section on the right, click + Add Image or + Add Text. A new control block for that asset will appear.

Position the Asset: You can position your new element in two ways:

Click and drag it directly on the Live Preview canvas.

Enter precise values in the X and Y input fields within the asset's control block.

View the Code: As you make changes, you'll see the HTML and CSS in the Generated Code box update in real-time.

3. Core Features: A Detailed Guide
   Global Settings (Left Panel)
   Download/Import JSON:

Download JSON: Saves your entire project (all assets, animations, and settings) into a .json file. This is the perfect way to save your work and continue later.

Import JSON file: Loads a previously saved .json project file, restoring your banner exactly as you left it.

Banner Size: Sets the width and height of your banner in pixels.

Snap to 10px Grid: When enabled, dragging elements on the canvas will cause them to "snap" to a 10-pixel grid for easy alignment.

Enable ISI: (For pharmaceutical ads) Toggles the visibility of the Important Safety Information (ISI) scrolling box.

Edit ISI: When ISI is enabled, this button opens a pop-up editor to customize the ISI text content.

Trace Image Overlay: A powerful tool for recreating existing designs.

Choose File: Select an image from your computer to overlay on the preview area.

Opacity: Use the slider to make the trace image more or less transparent, allowing you to perfectly align your new elements on top of it.

Managing Assets (Right Panel)
When you add an image or text, a collapsible control block appears for it.

For Both Images and Text:
Position (X, Y): Sets the top-left coordinate of the element.

Click Tag: Makes the element clickable.

Click URL: The web address the user will be taken to.

Target: \_blank for a new window, \_self for the same window.

Animation Steps: The core of the animation engine. See the "Animating Your Banner" section below for details.

Image-Specific Properties:
Choose File: Select the image file from your computer.

Export Filename: The name the image file will have in the final code (e.g., hero-image.png).

Alt Text: Descriptive text for accessibility.

Dimensions (W, H): Sets the width and height.

Lock Aspect Ratio (🔗): Click the link icon to lock the width and height proportions. When locked, changing one will automatically update the other.

Text-Specific Properties:
Text Content: The text that will be displayed.

Font Size, Family, Color, Weight: Standard text styling options.

Width: The width of the text box. Text will wrap automatically if it exceeds this width.

Animating Your Banner
Each asset has its own animation timeline, built from one or more steps.

Click + Add Animation Step to create a new animation block.

Each step has the following properties:

Type: The kind of GSAP animation.

To: Animates to the "End State" values from the element's current state.

From: Animates from the "Start State" values to the element's current state.

From/To: Animates from the "Start State" to the "End State".

Set: Instantly places the element at the "End State" values without animation.

State Properties (Start & End):

X / Y: Moves the element horizontally or vertically.

Opacity: Fades the element in (1) or out (0).

Scale: Resizes the element (1 = 100%, 0.5 = 50%, 2 = 200%).

Rotation: Rotates the element in degrees.

Skew X / Skew Y: Tilts the element.

Timing & Easing:

Delay: How many seconds to wait before this step starts.

Duration: How many seconds the animation takes to complete.

Ease: The "personality" of the animation (e.g., bounce.out, power2.inOut).

Advanced Options:

Repeat: How many extra times to play the animation.

Repeat Delay: The pause in seconds between repeats.

Yoyo: If checked, the animation will play forwards and then reverse back to its start.

The Layers Panel (Left Panel)
The layers panel is essential for organizing complex banners. The topmost item in the list is the frontmost element on the canvas.

Reordering: Click and drag a layer to change its stacking order.

Renaming: Double-click a layer's name to give it a custom ID (e.g., "logo"). This custom name will be used as the element's ID in the final code.

Multi-Selection:

Ctrl + Click (or Cmd + Click on Mac) to select or deselect multiple individual layers.

Shift + Click to select a range of layers.

Layer Controls:

👁️ Visibility: Hides or shows the layer.

🔒 Lock: Prevents the layer from being moved or edited on the canvas.

📋 Duplicate: Creates an identical copy of the selected layer.

Positioning & Alignment (Right Panel Toolbar)
When one or more elements are selected, the alignment toolbar appears above the preview area.

Align to Canvas Toggle:

Off (Default): Aligns the selected elements relative to each other. For example, aligning left will move all selected items to match the x-position of the leftmost item in the group.

On: Aligns the selected elements relative to the banner canvas itself. For example, aligning left will move all selected items to the left edge of the banner.

Align Buttons: Align elements along their left, horizontal center, right, top, vertical center, or bottom edges.

Distribute Buttons: (Requires 3+ items) Evenly spaces the selected items horizontally or vertically.

Exporting Your Work
The Generated Code panel on the left shows the complete, ready-to-use HTML file for your banner. Click the Copy Code button to copy it to your clipboard.

Keyboard Shortcuts
Nudge: Select an element and use the Arrow Keys to move it by 1 pixel.

Nudge (Fast): Hold Shift + Arrow Keys to move by 10 pixels.

Delete: Press Delete or Backspace to remove selected elements.

Undo: Ctrl + Z (or Cmd + Z)

Redo: Ctrl + Y (or Cmd + Y)

This manual should cover everything you need to know to get the most out of BannerCraft. Happy creating!
