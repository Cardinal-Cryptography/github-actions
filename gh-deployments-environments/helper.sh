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
  echo "  create-deployment-status <owner> <repo> <deployment-id> <status>"
  echo "    Creates deployment status"
  echo ""
  echo "  delete-environment <owner> <repo> <env>"
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

check_deployment_id() {
  if [[ ! "${1}" =~ ^[0-9]{1,32}$ ]]; then
    echo "!!! deployment-id is invalid"
    exit 1
  fi
}

check_status() {
  if [[ ! "${1}" =~ ^[a-z_\-]{1,32}$ ]]; then
    echo "!!! status is invalid"
    exit 1
  fi
}

make_github_api_call() {
  if [[ "${1}" == "POST" ]]; then
    curl -L \
      -X "${1}" \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}"\
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/"${2}"/"${3}"/"${4}" \
      -d "${5}" > "${6}"
  fi
  if [[ "${1}" == "GET" ]]; then
    curl -L \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}"\
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/${2}/${3}/${4} > "${6}"
  fi
  if [[ "${1}" == "DELETE" ]]; then
    curl -L \
      -X "${1}" \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}"\
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/${2}/${3}/${4} > "${6}"
  fi
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
  if [[ -z "${arg_file}" ]]; then
    echo "!!! output-file-for-id is missing";
    exit 1;
  fi

  # Create deployment, which will automatically create an environment if it does not exist
  make_github_api_call "POST" "${arg_owner}" "${arg_repo}" "deployments" "{\"ref\":\"${arg_ref}\",\"environment\":\"${arg_env}\"}" "tmp-output.txt"

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
  arg_owner=${2:-}
  arg_repo=${3:-}
  arg_deployment_id=${4:-}
  arg_status=${5:-} # Same as 'state'
  check_owner_and_repo "${arg_owner}" "${arg_repo}";
  check_deployment_id "${arg_deployment_id}";
  check_status "${arg_status}";

  # Get deployment last statuses (we only need the first one)
  make_github_api_call "GET" "${arg_owner}" "${arg_repo}" "deployments/${arg_deployment_id}/statuses" "" "tmp-output.txt"

  # Compare current state of deployment with desired status
  last_state=$(cat tmp-output.txt | jq -r '.[0].state')
  if [[ "${last_state}" == "${arg_status}" ]]; then
    echo "Deployment ${arg_deployment_id} already has status of '${arg_status}'"
    exit 0
  fi

  # If the current state of deployment is different than $arg_status, update it
  make_github_api_call "POST" "${arg_owner}" "${arg_repo}" "deployments/${arg_deployment_id}/statuses" "{\"state\":\"${arg_status}\"}" "tmp-output2.txt"

  exit 0;
fi


# To remove the environment, we have to remove all its deployments
if [[ "${CMD}" == "delete-environment" ]]; then
  check_env_vars;
  arg_owner=${2:-}
  arg_repo=${3:-}
  arg_env=${4:-}
  check_owner_and_repo "${arg_owner}" "${arg_repo}";
  check_env "${arg_env}";

  # Get all deployment for a specified environment
  make_github_api_call "GET" "${arg_owner}" "${arg_repo}" "deployments?environment=${arg_env}" "" "tmp-output.txt"

  # Loop through all the deployments, get their statuses
  # and if any status is not 'inactive', change that.
  # Once deployment is 'inactive', remove it.
  for deployment_id in $(cat tmp-output.txt | jq -r '.[].id'); do
    make_github_api_call "GET" "${arg_owner}" "${arg_repo}" "deployments/${deployment_id}/statuses" "" "tmp-output2.txt"

    last_state=$(cat tmp-output2.txt | jq -r '.[0].state')
    if [[ "${last_state}" != "inactive" ]]; then
      make_github_api_call "POST" "${arg_owner}" "${arg_repo}" "deployments/${deployment_id}/statuses" '{"state":"inactive"}' "tmp-output3.txt"
    fi

    make_github_api_call "DELETE" "${arg_owner}" "${arg_repo}" "deployments/${deployment_id}" "" "tmp-output4.txt"
  done

  exit 0;
fi


print_syntax;
if [[ "${CMD}" != "" ]]; then
  exit 1;
fi

exit 0;