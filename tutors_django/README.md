# django_edu

Fake users:

1. michelle19@gmail.com - tutor 
2. braianmichels@yahoo.com - tutor 
3. ellakrit@gmail.com - student 
4. loganyu@gmail.com - student
5. tutorsuser@gmail.com - tutor
6. nikitakurpas123@gmail.com - tutor
pwd = HeLo^7$gyello
---------------------------------------------------------------------------------
SSH CONNECTION 
ssh username@your_server_ip

----------------------------------------------------------------------------------
# Cubelet CI/CD
1. git pull origin main
----------------------------------------------------------------------------------
systemctl daemon-reload
----------------------------------------------------------------------------------
/etc/systemd/system/gunicorn.service
----------------------------------------------------------------------------------
The reload command works only if the service file defines how to reload the service. 
If it's not defined, you can either add an ExecReload directive to the service file or simply use the restart command instead.
----------------------------------------------------------------------------------------------
*******************************To gracefully reload gunicorn**********************************
ps aux | grep gunicorn
kill -HUP <pid>
There maybe several gunicorn processes running for 2 users: root and django or www-data.
--------------------------------------------------------------------------------------------
journalctl -u gunicorn -n 20


# Nginx 
---------------------------------------------------------------------------------
Steps to changing SSL from Namecheap to Let's Encrypt
1. sudo apt-get update && sudo apt-get upgrade -y
2. Install Certbot.

Certbot is the client that communicates with Let's Encrypt to obtain SSL certificates.
Install Certbot and the necessary plugin for Nginx.
# sudo apt-get install certbot python3-certbot-nginx -y
3. Obtain the SSL Certificate
sudo certbot --nginx -d lighthouse-tutors.com -d www.lighthouse-tutors.com

Error occured:
Saving debug log to /var/log/letsencrypt/letsencrypt.log
---------------------------------------------------------------------------------
VIM commands to coment and uncomment the whole page
gg
Ctrl + V
G
I
#
Esc
:wq
-------------------
gg
Ctrl + V
G
0
l
x
:wq
------------------Local Droplet changes different from repo problem----------------
This will show if there are any modified files, untracked files, or changes that have been staged for commit.
git status

 Force Sync with GitHub Repo
If you're certain that the files in your GitHub repo are correct and you want to override any local changes on the Droplet, you can force a pull:

git fetch origin
git reset --hard origin/main

git fetch origin: Fetches the latest changes from the origin remote without merging them.
git reset --hard origin/main: Resets your local branch to exactly match the main branch from the origin remote, discarding any local changes.
Caution: The git reset --hard command will overwrite any local changes you’ve made. Make sure you don’t have anything important that isn’t committed.

 Verify the Files
After running the reset, check to ensure that the about.css file matches the version in your GitHub repo:

bash
Copy code
git diff origin/main -- about.css
