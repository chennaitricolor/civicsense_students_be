def userInput = true
def didTimeout = false
def app_name = 'gamefication'
def app_funtion = 'backend'
def dev_compose_file = 'docker-compose-dev.yaml'
def prod_compose_file = 'docker-compose-prod.yaml'

node {

stage 'Checkout code'
      // Checkout the repository and save the resulting metadata
      final scmVars = checkout(scm)
      env.TAG = "${scmVars.GIT_COMMIT}"
      echo "scmVars: ${TAG}"


stage 'Build Image'

      sh "docker build . -t ${app_name}/${app_funtion}:${TAG}"

stage 'dev'

      env.RELEASE_ENVIRONMENT = "dev"
      sh "docker-compose -f ${dev_compose_file} up -d "
}

// Kill Agent

// Input Step
timeout(time: 15, unit: "MINUTES") {
    input message: 'Do you want to approve the deploy in production?', ok: 'Yes'
}
// Start Agent Again
node {
stage 'prod'
      env.RELEASE_ENVIRONMENT = "dev"
      sh "docker-compose -f ${prod_compose_file} up -d "

}
