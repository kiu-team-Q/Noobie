#!/usr/bin/env node

import { execSync } from 'child_process';
import fetch from 'node-fetch';
import https from 'https';



// MAIN FUNCTION USING CURL REQUEST TO LOVABLE API (SENDING GIT DIFF ONLY)
async function main() {
    console.log(`⠀⠀⠀⠀⠀⠀⠀⠀⣠⣶⣶⣶⣦⠀⠀
⠀⠀⣠⣤⣤⣄⣀⣾⣿⠟⠛⠻⢿⣷⠀
⢰⣿⡿⠛⠙⠻⣿⣿⠁⠀⠀⠀⣶⢿⡇
⢿⣿⣇⠀⠀⠀⠈⠏⠀⠀⠀ Lovable
⠀⠻⣿⣷⣦⣤⣀⠀⠀⠀⠀⣾⡿⠃⠀
⠀⠀⠀⠀⠉⠉⠻⣿⣄⣴⣿⠟⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣿⡿⠟⠁⠀⠀⠀⠀`);
    console.log("🚀 Running AI Commit Review with Lovable❤️  AI...");

    // Get email and password from env vars or prompt
    let email = process.env.NOOBIE_EMAIL;
    let password = process.env.NOOBIE_PASSWORD;
    let rl;

    if (!email || !password) {
        const { createInterface } = await import('readline');
        rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    if (!email) {
        email = await new Promise((resolve) => {
            rl.question('Enter your email: ', resolve);
        });
    }

    if (!password) {
        password = await new Promise((resolve) => {
            rl.question('Enter your password: ', resolve);
        });
    }

    if (rl) {
        rl.close();
    }

    try {
        const response = await fetch('https://ffbfzqeblmokusdfbppr.supabase.co/functions/v1/get-user-rules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error('Authentication failed: Incorrect email or password.');
                process.exit(1);
            }
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log(`Name: ${data.name}`);
        console.log(`Company: ${data.company}`);
        console.log(`Position: ${data.position}`);
        console.log(`Score: ${data.score}`);
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        process.exit(1);
    }


    const userEmail = email;
    const userPassword = password;
    const gitDiff = execSync('git diff --cached', { encoding: 'utf8' });

    const data = JSON.stringify({
    email: userEmail,
    password: userPassword,
    gitDiff: gitDiff
    });

    const options = {
    hostname: 'ffbfzqeblmokusdfbppr.supabase.co',
    port: 443,
    path: '/functions/v1/validate-commit',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
    };

    const req = https.request(options, (res) => {
    let body = '';
    
    res.on('data', (chunk) => {
        body += chunk;
    });
    
    res.on('end', () => {
        const response = JSON.parse(body);
        console.log(`Category: ${response.category}`);
        console.log(`Score: ${response.score}`);
        console.log(`Feedback: ${response.feedback}`);
        
        if (!response.allow_commit) {
        console.error('❌ Commit blocked - code does not meet guidelines');
        process.exit(1); // Block commit
        } else {
        console.log('✅ Commit allowed');
        process.exit(0); // Allow commit
        }
    });
    });

    req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
    process.exit(1);
    });

    req.write(data);
    req.end();
}

main();
