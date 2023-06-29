#!/usr/bin/env bash

set -e

CMD=${1:-};



print_syntax() {
  echo "helper.sh <command> [args...]"
  echo ""
  echo "Required environment variables:"
  echo "  GITHUB_TOKEN  GitHub token used when calling API"
  echo ""
  echo "Available commands:"
  echo "  help"
  echo "    Prints this screen"
  echo ""
  echo "  create-deployment <owner> <repo> <env> <ref> <output-file-for-id>"
  echo "    Creates new deployment"
  echo ""
  echo "  create-deployment-status <feature-net-name>"
  echo "    Creates deployment status"
  echo ""
  echo "  delete-environment <feature-net-name>"
  echo "    Deletes environment and all deployments and statuses related to it"
  echo ""
}


check_env_vars() {
	if [[ -z "${GITHUB_TOKEN}" ]]; then
		echo "!!! GITHUB_TOKEN environment variable is not set";
		print_syntax;
		exit 1;
	fi
}

check_owner_and_repo() {
  echo "${1}"
  if [[ ! "${1}" =~ ^[a-zA-Z0-9_\-]{1,50}$ ]]; then
    echo "!!! owner is invalid"
    exit 1
  fi
  if [[ ! "${2}" =~ ^[0-9a-zA-Z_\-]{1,50}$ ]]; then
    echo "!!! repo is invalid"
    exit 1
  fi
}

check_env() {
  if [[ ! "${1}" =~ ^[0-9a-zA-Z_\-]{1,100}$ ]]; then
    echo "!!! env is invalid"
    exit 1
  fi
  if [[ "${1}" == "mainnet" || "${1}" == "testnet" || "${1}" == "devnet" ]]; then
    echo "!!! env cannot be one of 'mainnet', 'testnet' or 'devnet'"
    exit 1
  fi
}

check_ref() {
  if [[ ! "${1}" =~ ^[0-9a-zA-Z_.:\-]{1,100}$ ]]; then
    echo "!!! ref is invalid"
    exit 1
  fi
}

make_github_api_call() {
  curl -L \
    -X "${1}" \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${GITHUB_TOKEN}"\
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/${2}/${3}/deployments \
    -d "${4}" > "${5}"

  cat ${5}
}


if [[ "${CMD}" == "create-deployment" ]]; then
  check_env_vars;

  arg_owner=${2:-}
  arg_repo=${3:-}
  arg_env=${4:-}
  arg_ref=${5:-}
  arg_file=${6:-}
  check_owner_and_repo "${arg_owner}" "${arg_repo}";
  check_env "${arg_env}";
  check_ref "${arg_ref}";
  if [[ -n "${arg_file}" ]]; then
    echo "!!! output-file-for-id is missing";
    exit 1;
  fi

  make_github_api_call POST "${arg_owner}" "${arg_repo}" "{\"ref\":\"${arg_ref}\",\"environment\":\"${arg_env}\"}" "tmp-output.txt"

  deployment_id=$(cat tmp-output.txt | jq '.id')
  if [[ -n "${deployment_id}" ]]; then
    echo "${deployment_id}" > "${arg_file}"
  else
    echo "!!! Error creating deployment"
    exit 1
  fi

  exit 0;
fi

if [[ "${CMD}" == "create-deployment-status" ]]; then
  check_env_vars;
  exit 0;
fi

if [[ "${CMD}" == "delete-environment" ]]; then
  check_env_vars;
  exit 0;
fi


print_syntax;
if [[ "${CMD}" != "" ]]; then
  exit 1;
fi

exit 0;