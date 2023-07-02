---
author: "Brad"
title: "Custom Map Install Guide for BO3 Torrent"
date: "2023-07-02"
aliases: ["custom-map-guide"]
ShowToc: false
TocOpen: false
---

### Prerequisites
- BO3 Game Torrent (see our [torrent guide](/guides/torrents))
- BOIII Client (see our [BOIII download](/downloads/boiii) page)
- [SteamCMD](https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip) (Steam Console Client)

### Guide
1. **Visit the [Black Ops 3 Steam Workshop](https://steamcommunity.com/app/311210/workshop/)**
2. **Search the map that you want to download in the search bar**
    1. When you are on the map page, copy the mod ID from the end of the url to your clipboard.
    ![Image](https://i.imgur.com/WEYNDpF.png)
3. **Use SteamCMD to download the map**
    1. Download [SteamCMD](https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip)
    2. Extract SteamCMD and make sure it has it's own folder.
    ![Image](https://i.imgur.com/YOXO766.png)
    3. Open `steamcmd.exe` and wait for it to update.
    ![Image](https://i.imgur.com/UcwXX1e.png)
    4. Type `login anonymous` and press enter. This will log you into an anonymous account.
    ![Image](https://i.imgur.com/aEb2ddt.png)
    5. Type `workshop_download_item 311210 MODID` and replace `MODID` with the mod ID you copied from Step 2 and hit enter.
        - If you download times out, add `validate` at the end. (For Example: `workshop_download_item 311210 2926551695 validate`)
    6. Wait for the download to complete. There is no progress bar!
    7. Once your download is completed, locate where your map has been downloaded and open up the folder.
    ![Image](https://i.imgur.com/K0SPrNj.png)
4. **Make map folder in BO3 install folder**
    1. In the folder you located from the download, you should see a bunch of files.
    ![Image](https://i.imgur.com/CvlL4Ad.png)
    2. Pay attention to 2 certain files it should start with `zm_` or `mp_`. You will want to right click one of them and click “Rename” from the menu that pops up. Hit CTRL + C to copy the name to your clipboard.
    3. Now navigate to your BO3 install folder. For the torrent version, the folder should be called `t7_full_game`. You will want to create a folder inside and name it `usermaps` if it is not there already.
    ![Image](https://i.imgur.com/cFdvAbH.png)
    4. Once that is done, go inside the usermaps folder and make a brand new folder and the name will be what you copied from earlier (For Example: `zm_quiet_cosmos`). Do CTRL + V to paste the name in and hit enter and now your folder should be named like this:
5. **Copy map files to map folder you made**
    1. Open a new file explorer window and locate the map files from earlier (from Step 3)
    ![Image](https://i.imgur.com/CvlL4Ad.png)
    2. Copy all files in the folder and paste them (or drag and drop them) into the `zm_mapname` or `mp_mapname` folder you made in your BO3 usermaps folder
        - To select all files, press CTRL + A or select all files at once
        - To copy all the files, press CTRL + C or right click them and select `Copy`
        - To paste all the files in the new folder, press CTRL + V or right click and select `Paste` into the empty map folder
6. **Load up the BOIII Client or download it if you do not have it**
    1. Go into a solo or custom games match and go to the map selection screen and your custom map should appear.
    ![Image](https://i.imgur.com/5bbZyFP.png)
7. **Congratulations, you have successfully installed custom maps on the torrent version for BO3**

If you need more help or support, please join our [discord](http://discord.io/CBServers).

