use mysql;
create user everyone_sprint_mgr@localhost identified by 'admin1234';
create user everyone_sprint_app@localhost identified by 'admin1234';
create user 'everyone_sprint_mgr'@'%' identified by 'admin1234';
create user 'everyone_sprint_app'@'%' identified by 'admin1234';
# select host, user from user;

create database everyone_sprint default character set utf8 collate utf8_unicode_ci;
use everyone_sprint;
show variables like 'char%';

alter user 'everyone_sprint_mgr'@'localhost' identified with mysql_native_password by 'admin1234';
alter user 'everyone_sprint_app'@'localhost' identified with mysql_native_password by 'admin1234';
alter user 'root'@'localhost' identified with mysql_native_password by 'admin1234';
grant all privileges on everyone_sprint.* to everyone_sprint_mgr@localhost;
grant all privileges on everyone_sprint.* to everyone_sprint_mgr@'%';
grant all privileges on everyone_sprint.* to everyone_sprint_app@localhost;
grant all privileges on everyone_sprint.* to everyone_sprint_app@'%';
flush privileges;

show grants for everyone_sprint_mgr@localhost;
show grants for everyone_sprint_app@localhost;
