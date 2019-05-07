SHELL = /usr/bin/env bash -xeuo pipefail

validate:
	@aws cloudformation validate-template \
		--template-body file://sam.yml
build:
	@for handler in $$(find src/handlers -maxdepth 2 -type f -name 'package.json'); do \
		handler_dir=$$(dirname $$handler); \
		pwd_dir=$$PWD; \
		cd $$handler_dir; \
		yarn install; \
		cd $$pwd_dir; \
	done

deploy:
	@aws cloudformation package \
		--template-file sam.yml \
		--s3-bucket sam-artifacts-$$(aws sts get-caller-identity | jq .Account | sed 's/\"//g')-ap-northeast-1 \
		--output-template-file template.yml

	@aws cloudformation deploy \
		--template-file template.yml \
		--stack-name alexa-sampler-functions \
		--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
		--role-arn arn:aws:iam::$$(aws sts get-caller-identity | jq .Account | sed 's/\"//g'):role/sam-deploy/sam-deploy-role \
		--no-fail-on-empty-changeset

.PHONY: \
	validate \
	build \
	deploy
