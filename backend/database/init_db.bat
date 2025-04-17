@echo off
echo Initializing database...
"C:\Program Files\MySQL\MySQL Server 9.2\bin\mysql.exe" -u root -p5hubwins_1 < "D:\dbms\bloodhaven-landing-main 6\backend\database\Schema.sql"
echo Database initialization complete!
pause
