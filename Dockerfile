# nginx镜像
FROM nginx:latest

# 维护者信息
MAINTAINER majf "734663446@qq.com"

# 移除nginx容器的default.conf文件、nginx配置文件
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

# 把主机的nginx.conf文件复制到nginx容器的/etc/nginx文件夹下
COPY ./nginx.conf /etc/nginx/

#COPY ./cert/server.crt /cert/server.crt
#COPY ./cert/server.key /cert/server.key

# 拷贝前端vue项目打包后生成的文件到nginx下运行
COPY ./dist /usr/share/nginx/pc
COPY ./mobile/dist /usr/share/nginx/mobile
# 暴露3000端口
EXPOSE 3000

# 注：CMD不同于RUN，CMD用于指定在容器启动时所要执行的命令，而RUN用于指定镜像构建时所要执行的命令。
#    RUN指令创建的中间镜像会被缓存，并会在下次构建中使用。如果不想使用这些缓存镜像，可以在构建时指定--no-cache参数，如：docker build --no-cache

# 使用daemon off的方式将nginx运行在前台保证镜像不至于退出
CMD ["nginx", "-g", "daemon off;"]