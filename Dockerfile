# The lab runtime. Attendees are not expected to have Node installed, so
# everything Node-related happens in here.
FROM node:24-bookworm-slim

ENV NODE_ENV=development

# The project root is bind-mounted over /app at runtime (see compose.yaml), so
# dependencies are NOT baked into the image -- the compose `command` installs
# them into the mount instead. That is deliberate: it puts node_modules on the
# host where the editor can see it, which is what makes IntelliSense work in
# VS Code.
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app
USER node

EXPOSE 4000

CMD ["npm", "run", "dev"]
