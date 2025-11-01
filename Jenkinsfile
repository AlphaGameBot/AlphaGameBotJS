// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
// 
//     AlphaGameBot is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
// 
//     AlphaGameBot is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with AlphaGameBot.  If not, see <https://www.gnu.org/licenses/>.

def stageWithPost(String name, Closure body) {
    stage(name) {
        def start = System.currentTimeMillis()
        try {
            body()
        } finally {
            def end = System.currentTimeMillis()
            def durationMs = end - start
            def durationSec = (durationMs / 1000) as Integer
        
            // Format duration as minutes and seconds if over 60 seconds
            def durationStr
            if (durationSec >= 60) {
                def minutes = (int)(durationSec / 60)
                def seconds = (int)(durationSec % 60)
                durationStr = "${minutes} minutes, ${seconds} seconds"
            } else {
                durationStr = "${durationSec}s"
            }
        
            // 💬 Send message to Discord webhook
            def discordWebhookUrl = env.JENKINS_NOTIFICATIONS_WEBHOOK

            // escape quotes for JSON
            def message = "<:jenkins:1428899392810909747> **${name}** done in ${durationStr}"

            sh """
            curl -H "Content-Type: application/json" \
                 -X POST \
                 -d '{"content": "${message}"}' \
                 ${discordWebhookUrl}
            """
        }
    }
}

pipeline {
    agent {
        docker {
            image 'boisvert/python-build'
            args '-v /var/run/docker.sock:/var/run/docker.sock -u root'
        }
    }
    environment {
        TOKEN = credentials('alphagamebot-token')
        WEBHOOK = credentials('alphagamebot-webhook')
        JENKINS_NOTIFICATIONS_WEBHOOK = credentials('discord-jenkins-webhook')
        DOCKER_TOKEN = credentials('alphagamedev-docker-token')
        AGB_VERSION = sh(returnStdout: true, script: "cat package.json | jq '.version' -cMr").trim()
        PUSHGATEWAY_URL = 'http://pushgateway:9091'
        LOKI_URL = "http://loki:3100"

        COMMIT_MESSAGE = sh(script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()
    
        // MySQL stuff
        MYSQL_HOST = "mysql"
        MYSQL_DATABASE = "alphagamebot"
        MYSQL_USER = "alphagamebot" 
        MYSQL_PASSWORD = credentials('alphagamebot-mysql-password-v2')

        ENGINEERING_OPS_DISCORD_ID = 420052952686919690
        ERROR_WEBHOOK_URL = credentials('alphagamebot-webhook')
        DATABASE_URL = "mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_HOST/$MYSQL_DATABASE"
    }
    
    stages {
        stage('precheck') {
            steps {
                script {
                    def msg = sh(script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()
                    if (msg =~ /(?i)\[(no|skip)\s*ci\]/) {
                        echo "No CI detected in commit message. Skipping build."
                        currentBuild.result = 'SUCCESS'
                        // Set a flag to skip remaining stages
                        env.SKIP_REMAINING_STAGES = 'true'
                        // Use 'return' to exit this stage early without erroring
                        return
                    } else {
                        echo "CI will proceed."
                    }
                }
            }
        }

        stage('notify') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    def discordTitle = "${env.JOB_NAME} - Build #${env.BUILD_NUMBER} Started"
                    def discordDescription = "Commit: ${env.GIT_COMMIT}\nBranch: ${env.BRANCH_NAME}\nBuild URL: ${env.BUILD_URL}"
                    discordSend(
                        webhookURL: env.JENKINS_NOTIFICATIONS_WEBHOOK,
                        title: discordTitle,
                        description: discordDescription,
                        link: env.BUILD_URL,
                        result: 'STARTED'
                    )

                    sh 'curl -X POST -H "Content-Type: application/json" $JENKINS_NOTIFICATIONS_WEBHOOK -d \'{"content": "<:jenkins:1428899392810909747> Build **#${BUILD_NUMBER}** started for **${JOB_NAME}** (Version: **${AGB_VERSION}**)"}\''
                }
            }
        }
        stage('build') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    stageWithPost('build') {
                        echo "Building"
                        // 8/1/2024 -> No Cache was added because of the fact that Pycord will never update :/
                        // ----------> If you know a better way, please make a pull request!
                        sh 'docker build -t alphagamedev/alphagamebot:$AGB_VERSION \
                                        --build-arg COMMIT_MESSAGE="$COMMIT_MESSAGE" \
                                        --build-arg BUILD_NUMBER="$BUILD_NUMBER" \
                                        --build-arg BRANCH_NAME="$BRANCH_NAME" \
                                        --build-arg VERSION="$AGB_VERSION" \
                                        .'
                    }
                }
            }
        }
        /*stage('push') {
            steps {
                echo "Pushing image to Docker Hub"
                sh 'echo $DOCKER_TOKEN | docker login -u alphagamedev --password-stdin'
                sh 'docker tag  alphagamedev/alphagamebot:$AGB_VERSION alphagamedev/alphagamebot:latest' // point tag latest to most recent version
                sh 'docker push alphagamedev/alphagamebot:$AGB_VERSION' // push tag latest version
                sh 'docker push alphagamedev/alphagamebot:latest' // push tag latest
                sh 'docker logout'
            }
        }*/
        stage('deploy-commands') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    stageWithPost('deploy-commands') {
                        sh "docker run --rm -i --network=alphagamebot-net --name agb-temp-deploy-cmds -e NODE_ENV=deploy -e TOKEN -e DATABASE_URL --entrypoint sh alphagamedev/alphagamebot:$AGB_VERSION -c 'node ./dist/deploy-commands.js'"
                    }
                }
            }
        }
        stage('deploy-database') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    stageWithPost('deploy-database') {
                        sh "docker run --rm -i --network=alphagamebot-net --name agb-temp-migrate -e NODE_ENV=deploy -e DATABASE_URL --entrypoint sh alphagamedev/alphagamebot:$AGB_VERSION -c 'npx prisma migrate deploy'"
                    }
                }
            }
        }
        stage('deploy') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    stageWithPost('deploy') {
                        // conditionally deploy
                        sh "docker container stop alphagamebotjs || true"
                        sh "docker container rm alphagamebotjs -f || true"
                        sh "docker run --detach --tty  \
                                        --name alphagamebotjs \
                                        -e TOKEN -e WEBHOOK -e BUILD_NUMBER -e ENGINEERING_OPS_DISCORD_ID -e ERROR_WEBHOOK_URL \
                                        -e DATABASE_URL -e PUSHGATEWAY_URL -e LOKI_URL --restart=always \
                                        --network=alphagamebot-net --ip 10.7.1.64 --hostname alphagamebot \
                                        alphagamedev/alphagamebot:$AGB_VERSION" // add alphagamebot flags
                    }
                }
            }
        }
    }
    post {
        always {
            // Only send notification if build was not skipped
            script {
                if (env.SKIP_REMAINING_STAGES != 'true') {
                    def buildStatus = currentBuild.currentResult ?: 'SUCCESS'
                    def discordTitle = "${env.JOB_NAME} - Build #${env.BUILD_NUMBER} ${buildStatus}"
                    def discordDescription = "Commit: ${env.GIT_COMMIT}\nBranch: ${env.BRANCH_NAME}\nBuild URL: ${env.BUILD_URL}"
                    discordSend(
                        webhookURL: env.JENKINS_NOTIFICATIONS_WEBHOOK,
                        title: discordTitle,
                        description: discordDescription,
                        link: env.BUILD_URL,
                        result: buildStatus
                    )
                } else {
                    echo "Build was skipped, not sending Discord notification."
                }
            }
        }
    }
}
