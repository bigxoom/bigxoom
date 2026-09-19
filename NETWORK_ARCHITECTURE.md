# Network Architecture

```
Internet (optional)
     │
Firewall / Router
     │
Core Managed Switch
     │
Local ERP Server ── Department VLANs
```

## Recommended VLANs
| VLAN | Purpose |
|---|---|
| 10 | Administration |
| 20 | Reception |
| 30 | POS (restaurant/bar terminals) |
| 40 | Kitchen displays |
| 50 | Staff devices |
| 60 | CCTV |
| 70 | Guest Wi-Fi |
| 80 | Server / infrastructure |

## Firewall policy (recommended)
- Guest Wi-Fi (VLAN 70) → **no route** to VLAN 80 (server) or any other
  internal VLAN. Internet-only.
- Staff/operational VLANs (10–50) → allowed to reach the server on VLAN 80,
  ports 80/443 only.
- CCTV (VLAN 60) → isolated, no route to the ERP server.
- Server (VLAN 80) → outbound internet allowed only for updates and optional
  encrypted cloud backup; no inbound from the internet unless remote admin
  is explicitly enabled through a VPN.

## Hardware checklist
Managed switch with VLAN support · enterprise Wi-Fi access points ·
firewall/router with VLAN + firewall rules · UPS for server and core
switch · structured cabling to reception, restaurant, bar, kitchen,
housekeeping office, maintenance office, store, accounts office.

This document is the deployment guide for OfficeHomeTechX's networking team
on-site; it is not automated by this software package.
