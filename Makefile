.PHONY: dev build

# Hugo compiles Tailwind itself via css.TailwindCSS in layouts/baseof.html,
# so there is no separate CSS watcher to run.
dev:
	hugo server -D

build:
	hugo --gc --minify
