---
layout: post
title:  "Seiki 4K 39-inch TV as a computer monitor"
date:   2014-11-04 15:33
categories: equipment
---
I recently bought a [Seiki SE39UY04 4K TV][Amazon buy] when it was on sale for \$339. I'm using it with a Mid 2014 15-inch MacBook Pro, connected via its built-in HDMI port.

Some notes on setup:

##Monitor arrangement
Use the Displays panel in System Preferences, and drag the displays so that they more or less match your physical configuration. I like matching corners together, so that my mouse doesn't get caught there when I move across the screens.

If you have an asymmetric desk, I think it's better to put the Seiki TV on the left, because most such desks are right-handed and have drawers on the right. This means you have to sit on the left side of the desk where there is leg room, and so your main monitor should be on the left. If your desk is left-handed, reverse this.

##Mouse lag
You will need to update the firmware in the TV. 

1. Use a Windows PC to format a USB flash drive as FAT32. (I used Parallels.)
2. Download the [firmware].
3. Unzip the firmware to get install.img, then copy this firmware image to the flash drive.
4. Eject the disk.
5. Plug it into the TV.
6. Open the service menu. On the remote, press:
    1. Menu
    2. 0, four times
    3. Select Software upgrade
    4. Select Yes.
7. The TV will turn off and flash the power light blue and red. After a minute, the TV will turn on again. Mouse lag should be much improved.

##Blurry text
In the menu, turn sharpness down to 0.

##Colors
In the menu, set brightness to ~25 and contrast to ~62. Then, in the Displays panel in System Preferences, calibrate the display with advanced options.

##Auto-off
By the default, the TV will turn off after a few hours, even when a signal is present. To prevent this,

1. Open the service menu. On the remote, press:
    1. Menu
    2. 0, four times
2. Select Others
3. Press up to wrap to the bottom of the menu.
4. Turn the auto-off setting off.
5. Press Exit.

Also, the TV will turn off in about a minute if no signal is present. This happens if your Mac goes to sleep. To prevent this,

1. Open System Preferences on the Mac.
2. Open Energy Saver.
3. For Power Adapter, set "Turn display off after" to "Never."

##Turn monitor on when plugged in
When I first set this, I thought it meant that the TV would turn on as soon as I connected HDMI to my laptop. I was wrong. Instead, this setting affects what happens when *power* is plugged in, not video.

But, if you want the convenience of your monitor always being on, and to turn it on automatically after a power interruption, you can. The power draw is ~80W at my backlight settings.

1. Open the service menu. On the remote, press:
    1. Menu
    2. 0, four times
2. Select Others.
3. Turn Auto Power On on.
4. Press Exit.

* * *

**Edits:**

Nov 9, 2014:
    More info on monitor arrangement and Auto Power On setting.


[Amazon buy]: http://www.amazon.com/Seiki-SE39UY04-39-Inch-Ultra-Discontinued/dp/B00DOPGO2G
[firmware]: http://www.seiki.com/support/downloads.php#firmware
