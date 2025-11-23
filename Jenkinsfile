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
        DISCORD_CLIENT_SECRET = credentials('alphagamebot-client-secret')
        DISCORD_CLIENT_ID = sh(returnStdout: true, script: "curl -H \"Authorization: Bot ${TOKEN}\" https://discord.com/api/users/@me | jq .id -cMr").trim()
        WEBHOOK = credentials('alphagamebot-webhook')
        JENKINS_NOTIFICATIONS_WEBHOOK = credentials('discord-jenkins-webhook')
        UPTIME_POLL_URL = 'http://kuma:3001/api/push/J8C7hyZzdg'
        DOCKER_TOKEN = credentials('alphagamedev-docker-token')
        GITHUB_PAT = credentials('github-token-alphagamebotqa')
        AGB_VERSION = sh(returnStdout: true, script: "cat bot/package.json | jq '.version' -cMr").trim()
        WEB_VERSION = sh(returnStdout: true, script: "cat web/package.json | jq '.version' -cMr").trim()
        PUSHGATEWAY_URL = 'http://pushgateway:9091'
        LOKI_URL = "http://loki:3100"

        COMMIT_MESSAGE = sh(script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()
    
        // MySQL stuff
        MYSQL_HOST = "postgres"
        MYSQL_DATABASE = "alphagamebot"
        MYSQL_USER = "alphagamebot" 
        
        // yeah it's called mysql-password but it's also for postgres
        // -- post migration to PostgreSQL.  Don't judge me. :3
        MYSQL_PASSWORD = credentials('alphagamebot-mysql-password-v2')

        ENGINEERING_OPS_DISCORD_ID = 420052952686919690
        ERROR_WEBHOOK_URL = credentials('alphagamebot-webhook')
        DATABASE_URL = "postgresql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_HOST/$MYSQL_DATABASE"
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

                    sh 'curl -X POST -H "Content-Type: application/json" $JENKINS_NOTIFICATIONS_WEBHOOK -d \'{"content": "<:jenkins:1428899392810909747> Build **#$BUILD_NUMBER** started for **$JOB_NAME** (Version: **$AGB_VERSION**)"}\''
                }
            }
        }
        stage('build-bot') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    stageWithPost('build-bot') {
                        echo "Building"
                        // 8/1/2024 -> No Cache was added because of the fact that Pycord will never update :/
                        // ----------> If you know a better way, please make a pull request!
                        sh 'docker build -t alphagamedev/alphagamebot:$AGB_VERSION \
                                        --build-arg COMMIT_MESSAGE="$COMMIT_MESSAGE" \
                                        --build-arg BUILD_NUMBER="$BUILD_NUMBER" \
                                        --build-arg BRANCH_NAME="$BRANCH_NAME" \
                                        --build-arg VERSION="$AGB_VERSION" \
                                        -f bot/Dockerfile .'
                    }
                }
            }
        }

        stage('build-web') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    stageWithPost('build-web') {
                        echo "Building webui"
                        sh 'docker build -t alphagamedev/alphagamebot:web-$WEB_VERSION \
                                        --build-arg COMMIT_MESSAGE="$COMMIT_MESSAGE" \
                                        --build-arg BUILD_NUMBER="$BUILD_NUMBER" \
                                        --build-arg BRANCH_NAME="$BRANCH_NAME" \
                                        --build-arg VERSION="$WEB_VERSION" \
                                        -f web/Dockerfile .'
                    }
                }
            }
        }
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
        stage('deploy-bot') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    stageWithPost('deploy-bot') {
                        // conditionally deploy
                        sh "docker container stop alphagamebotjs || true"
                        sh "docker container rm alphagamebotjs -f || true"
                        sh "docker run --detach --tty  \
                                        --name alphagamebotjs \
                                        -e TOKEN -e WEBHOOK -e BUILD_NUMBER -e ENGINEERING_OPS_DISCORD_ID -e ERROR_WEBHOOK_URL \
                                        -e DATABASE_URL -e PUSHGATEWAY_URL -e LOKI_URL -e GITHUB_PAT -e UPTIME_POLL_URL --restart=always \
                                        --network=alphagamebot-net --ip 10.7.1.64 --hostname alphagamebot \
                                        -v /home/damien/migration-json/stats_export_20251118_173149.json:/lazy_population.json:ro \
                                        alphagamedev/alphagamebot:$AGB_VERSION" // add alphagamebot flags
                    }
                }
            }
        }

        stage('deploy-web') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    stageWithPost('deploy-webui') {
                        // conditionally deploy
                        sh "docker container stop alphagamebot-webui || true"
                        sh "docker container rm alphagamebot-webui -f || true"
                        sh "docker compose -p alphagamebotjs exec -i nginx rm -rf /var/cache/nginx/* || true"
                        sh "docker run --detach --tty  \
                                        --name alphagamebot-webui \
                                        -e BUILD_NUMBER -e DATABASE_URL -e PUSHGATEWAY_URL -e LOKI_URL -e GITHUB_PAT \
                                        -e DISCORD_CLIENT_ID -e DISCORD_CLIENT_SECRET \
                                        -e NEXT_PUBLIC_BASE_URL='https://alphagamebot.com' \
                                        --restart=always --network=alphagamebot-net --ip 10.7.1.128 \
                                        --hostname alphagamebot-webui \
                                        alphagamedev/alphagamebot:web-$WEB_VERSION"
                    }
                }
            }
        }

        stage('push-bot') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    stageWithPost('push-bot') {
                        echo "Pushing bot image to Docker Hub"
                        sh 'echo $DOCKER_TOKEN | docker login -u alphagamedev --password-stdin'
                        sh 'docker tag alphagamedev/alphagamebot:$AGB_VERSION alphagamedev/alphagamebot:latest'
                        sh 'docker push alphagamedev/alphagamebot:$AGB_VERSION'
                        sh 'docker push alphagamedev/alphagamebot:latest'
                        sh 'docker logout'
                    }
                }
            }
        }

        stage('push-web') {
            when {
                expression { env.SKIP_REMAINING_STAGES != 'true' }
            }
            steps {
                script {
                    stageWithPost('push-web') {
                        echo "Pushing web image to Docker Hub"
                        sh 'echo $DOCKER_TOKEN | docker login -u alphagamedev --password-stdin'
                        sh 'docker tag alphagamedev/alphagamebot:web-$WEB_VERSION alphagamedev/alphagamebot:web-latest'
                        sh 'docker push alphagamedev/alphagamebot:web-$WEB_VERSION'
                        sh 'docker push alphagamedev/alphagamebot:web-latest'
                        sh 'docker logout'
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
