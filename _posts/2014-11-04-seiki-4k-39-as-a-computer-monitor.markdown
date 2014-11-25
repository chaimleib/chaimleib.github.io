---
layout: post
title:  "Seiki 4K 39-inch TV as a computer monitor"
date:   2014-11-04 15:33
categories: equipment
---
I recently bought a [Seiki SE39UY04 4K TV][Amazon buy] when it was on sale for $339. I'm using it with a Mid&nbsp;2014 15&#8209;inch MacBook Pro, connected via its built-in HDMI port.

I would not recommend this TV for games relying on quick reflexes (unless you set the resolution to 1080p). The refresh rate at 4k is noticeably slower than a real monitor, at 30&nbsp;Hz instead of 60&nbsp;Hz or higher. Also, there is a significant input lag. The firmware update roughly halves the lag, making it quite usable for productivity applications, but gamers will still be quite irritated.

Nevertheless, I highly recommend the TV for productivity purposes. I regularly use it with four large windows displaying at once, and plenty of space for utilities on the side. Coupled with my laptop's screen, it's a real battlestation.

For computer-based movie watching, it is a winner. Most movies are at ~30&nbsp;fps, so the Seiki is an excellent match for that. (Hey, it *is* a TV.) You will, however, still want the firmware update, or you will notice significant jerkiness on slow, panning shots.

I wish there were more actual computer monitors at this glorious size!

Some notes on setup:

## Monitor arrangement
Use the Displays panel in System Preferences, and drag the displays so that they more or less match your physical configuration. I like matching corners together, so that my mouse doesn't get caught there when I move across the screens.

If you have an asymmetric desk, be careful to put your main monitor directly in front of where you sit. Most desks are right-handed, and this means you have to sit on the left side where there is leg room. So for most desks, your main monitor should be on the left, directly in front of you. If your desk is left-handed, reverse this.

## Mouse lag
You will need to update the firmware in the TV. 

1. Use a Windows PC to format a USB flash drive as FAT32. (I used Parallels.)
2. Download the [firmware]. (Get the one that adds in backlight controls, or else your backlight settings will be forgotten whenever the TV powers off.)
3. Unzip the firmware to get install.img, then copy this firmware image to the flash drive.
4. Eject the disk.
5. Plug it into the TV.
6. Open the service menu. On the remote, press:
    1. Menu
    2. 0, four times
    3. Select Software upgrade
    4. Select Yes.
7. The TV will turn off and flash the power light blue and red. After a minute, the TV will turn on again. Mouse lag should be much improved.

## Blurry text

### Sharpness setting
In the TV's menu, turn sharpness down to 0.

### Force RGB color space
Because the Mac detects the Seiki as a TV, it tries to use the YCrPb color space common on TVs. However, this results in subpixel inaccuracies and blurry text.

1. Get the ruby script:
    1. Go to [https://gist.github.com/adaugherity/7435890]().
    2. Click the Raw button.
    3. Save the script with Cmd-S.

2. Run it from the Terminal:
    1. Navigate to the script's location with `cd <location>`
    2. `ruby patch-edid.rb`

3. Install the new config with 

        sudo mv DisplayVendorID* /System/Library/Displays/Overrides 

    You will be asked for your password.
    
4. Restart your Mac.

## Colors
In the menu, set brightness to ~25 and contrast to ~62. Then, in the Displays panel in System Preferences, calibrate the display with advanced options.

## Auto-off
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

## Turn monitor on when plugged in
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
    More info on monitor arrangement and Auto Power On setting. Added recommended usage in intro.

Nov 24, 2014:
    Added section Force RGB color space

Nov 25, 2014:
    The backlight-enabled firmware will also work.

[Amazon buy]: http://www.amazon.com/Seiki-SE39UY04-39-Inch-Ultra-Discontinued/dp/B00DOPGO2G
[firmware]: http://www.seiki.com/support/downloads.php#firmware
