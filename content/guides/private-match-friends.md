---
author: "Brad"
title: "How to Play Private Match with Friends"
date: "2026-01-12"
aliases: ["private-match-guide"]
ShowToc: false
TocOpen: false
---

### Introduction

Due to the nature of these community clients being separated from Steam's infrastructure, it's not possible to add friends through the traditional Steam interface and join their games directly. Instead, you'll need to connect to an active match using a VPN solution like Radmin VPN or by port forwarding (Public IP method). This guide covers both methods.

### Prerequisites
- One of the supported game clients installed:
  - [BOIII (Black Ops 3)](/downloads/boiii)
  - [S1X (Advanced Warfare)](/downloads/s1x)
  - [IW6X (Ghosts)](/downloads/iw6x)
  - [H1-Mod (Modern Warfare Remastered)](/downloads/h1-mod)
  - [IW7-Mod (Infinite Warfare)](/downloads/iw7-mod)
  - [HMW (HorizonMW)](/downloads/hmw)
- The client executable in your game folder
- For Radmin VPN method: [Radmin VPN](https://www.radmin-vpn.com/) installed
- For Public IP method: Access to your router for port forwarding


### Client Port Numbers:
- BOIII: `27017`
- S1X: `27016`
- IW6X: `27016`
- H1-Mod: `27016`
- IW7-Mod: `27016`
- HMW: `27016`

---

## Method 1: Hosting with Radmin VPN (Easier Method)

### Initial Setup (All Players)

1. **Download and install [Radmin VPN](https://www.radmin-vpn.com/)**

2. **Allow the client through Windows Firewall**
   - Go to Windows Firewall settings
   - Click "Change Settings" > "Allow another app"
   - Browse to your client executable
   - Ensure all boxes are ticked, then click OK
   - [Detailed firewall guide](https://www.youtube.com/watch?v=Kxy36eKoYNk)

3. **Create firewall rules for your client port**
   - Open Windows Firewall with Advanced Security
   - Create both Inbound and Outbound rules for your client's port number [(see port numbers above)](#client-port-numbers)
   - **Important:** Make sure protocol to UDP, not TCP. 
   - [Video guide for firewall configuration](https://youtu.be/cRZ26576d1g?t=79)

### Network Setup (Host)

1. **Create a Radmin VPN network**
   - Open Radmin VPN
   - Click Network > Create Network
   - Set a network name and password

2. **Share network credentials**
   - Give the network name and password to your friends

### Network Setup (Friends)

1. **Join the Radmin VPN network**
   - Open Radmin VPN
   - Click Network > Join Network
   - Enter the network name and password provided by the host
   - Click Join

### Starting the Match (Host)

1. **Launch your client and start an Unranked or Custom match**
   - Open the client executable (e.g., `boiii.exe`)
   - Naviagte to your desired mode, choose a map and start the match

2. **Find your Radmin IP address**
   - Open Radmin VPN
   - Your IP will be displayed in the network list (e.g., `26.118.191.42`)
   - Share this IP with your friends

![Image](https://i.imgur.com/LCOFHby.png)

3. **Limit player count (optional)**
   - Once in-game, open the console (`` ` `` or `~` key, typically under ESC)
   - Type: `com_maxclients X` or `sv_maxclients X` (replace X with desired player count)
   - Example: `com_maxclients 2` or `sv_maxclients 2` for 2 players total

### Joining the Match (Friends)

1. **Wait for the host to spawn in-game**

2. **Connect via console**
   - Open the in-game console (`` ` `` or `~` key)
     - On 60% keyboards: `Fn+ESC`
   - Type: `connect RadminIP:PORT`
   - Example: `connect 26.118.191.42:27017`
   - Use the Radmin IP provided by the host and the appropriate port for your client

3. **Wait for the game to load and have fun!**

---

## Method 2: Hosting with Public IP and Port Forwarding (Advanced Method)

### Host Setup

1. **Port forward the appropriate port (UDP) on your router**
   - Forward the UDP port for your specific client [(see port numbers above)](#client-port-numbers) to the device you're playing on
   - Consult your router's documentation for port forwarding instructions or follow this [port forward guide](https://portforward.com/how-to-port-forward/)
   - Only recommeneded if your Public IP is static

2. **Create Windows Firewall inbound rule**
   - Open Windows Defender Firewall with Advanced Security
   - Create an inbound rule to permit UDP traffic on your client's port
   - [Video guide for firewall configuration](https://youtu.be/cRZ26576d1g?t=79)

3. **Allow the client through Windows Firewall**
   - Go to Windows Firewall settings
   - Click "Change Settings" > "Allow another app"
   - Browse to your client executable (e.g., `boiii.exe`, `s1x.exe`, etc.)
   - Ensure all boxes are ticked, then click OK
   - [Detailed firewall guide](https://www.youtube.com/watch?v=Kxy36eKoYNk)

4. **Disable anti-virus interference**
   - Ensure no other anti-virus programs are blocking or filtering network access to the application

5. **Find your public IP address**
   - Visit [whatismyipaddress.com](https://whatismyipaddress.com/)
   - Note down your IPv4 address on the page for later

### Starting the Match (Host)

1. **Launch your client and start an Unranked or Custom match**
   - Open the client executable (e.g., `boiii.exe`)
   - Naviagte to your desired mode, choose a map and start the match

2. **Limit player count (optional)**
   - Once in-game, open the console (`` ` `` or `~` key, typically under ESC)
   - Type: `com_maxclients X` or `sv_maxclients X` (replace X with desired player count)
   - Example: `com_maxclients 2` or `sv_maxclients 2` for 2 players total

### Joining the Match (Friends)

1. **Wait for the host to start the match**
   - The host must be in the actual game, not just in the lobby

2. **Connect via console**
   - Open the in-game console (`` ` `` or `~` key)
     - On 60% keyboards: `Fn+ESC`
   - Type: `connect IP:PORT`
   - Example: `connect 192.168.1.100:27017`
   - Use the host's public IP and the appropriate port for your client

---

If you need more help or support, please join our [discord](/discord).