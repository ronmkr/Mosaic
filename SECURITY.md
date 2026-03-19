# Security Policy

## Supported Versions

Currently, only the latest release of Mosaic Home receives active security updates. 

| Version | Supported          |
| ------- | ------------------ |
| v1.x.x  | :white_check_mark: |
| < v1.0  | :x:                |

## Reporting a Vulnerability

We take the security of Mosaic Home seriously. If you believe you have found a security vulnerability, please report it to us immediately. 

**Do not create a public GitHub issue.** Instead, please follow these steps:

1. **Email:** Send an email to `raunak.jyotishi@gmail.com`.
2. **Subject:** Use the subject line "SECURITY VULNERABILITY: Mosaic Home".
3. **Details:** Provide as much information as possible, including:
   - A description of the vulnerability.
   - The steps required to reproduce the issue.
   - Your system configuration (Browser version, OS, etc.).
   - A proposed solution (if you have one).

### What to Expect

- You should receive an acknowledgment of your report within 48 hours.
- We will investigate the issue and determine its impact.
- If the vulnerability is confirmed, we will work on a patch and aim to release a security update as quickly as possible.
- Once the vulnerability has been patched and released, we will publicly disclose the issue and give you credit for the discovery (if desired).

## Core Security Posture

Mosaic Home is a client-side Chrome Extension that operates entirely locally. 
- **No External Servers:** We do not collect, send, or store your data on external servers.
- **Chrome Native APIs:** We rely strictly on Chrome's native `bookmarks` and `storage` APIs, ensuring data never leaves your device.
- **Manifest V3 Constraints:** We rigorously adhere to modern Content Security Policies (CSP), preventing inline script execution and unauthorized external resource loading.
