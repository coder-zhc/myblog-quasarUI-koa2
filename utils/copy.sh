#!/bin/sh
cd access.log的路径下
cp access.log $(date +%Y-%m-%d).access.log
echo "" > access.log

# 在上面的文件编写完后 通过crontab -e 来设置一个定时任务
# crontab -e 会进入到一个可编辑的地方，然后添加 执行这个脚本的任务
# 大概 如何添加 * 0 * * * sh xxx/copy.sh 