.PHONY: dev build

# Hugo compiles Tailwind itself via css.TailwindCSS.
dev:
	hugo server -D

build:
	hugo --gc --minify
