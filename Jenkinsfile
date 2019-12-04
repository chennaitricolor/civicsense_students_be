def userInput = true
def didTimeout = false
def dev_compose_file = 'docker-compose-dev.yml'
def prod_compose_file = 'docker-compose-prod.yml'

node {

stage 'Clean WorkSpace'
       cleanWs()
       
stage 'Clean Exited Containers'
       sh "docker container prune --force"
       
stage 'Checkout code'
      // Checkout the repository and save the resulting metadata
      final scmVars = checkout(scm)
      env.TAG = "${scmVars.GIT_COMMIT}"
      echo "scmVars: ${TAG}"


stage 'Build Image'
      
      sh "docker build . -t ${APP_NAME}/${APP_TYPE}:${TAG}"

stage 'dev'
      env.RELEASE_ENVIRONMENT = "dev"
      sh "docker-compose -f ${dev_compose_file} down "
      sh "docker-compose -f ${dev_compose_file} up -d "
}
