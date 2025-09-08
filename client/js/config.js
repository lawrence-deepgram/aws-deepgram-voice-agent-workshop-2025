const state = {
    status: 'awake',
    callID: null,
    events: [],
    initializedAgent: false,
    conversation: [],
};

// const BASE_URL = '<your-ngrok-endpoint-here>';

const baseConfig = {
    "type": "Settings",
    "audio": {
        "input": { "encoding": "linear16", "sample_rate": 16000 },
        "output": { "encoding": "linear16", "sample_rate": 48000 }
    },
    "agent": {
        "listen": { "provider": { "type": "deepgram", "model": "nova-3" } },
        "think": {
            "provider": { "model": "gpt-4o-mini" },
            "prompt": "You are a helpful AI assistant. Keep responses concise."
        },
        "speak": { "provider": { "type": "deepgram", "model": "aura-2-thalia-en" },
        },
        "greeting": "Hello, I am an AI assistant for Health Insurance questions. How can I help you today?"
    }
}
  

function getStsConfig(callID) {
    return {
        ...baseConfig,
        agent: {
            ...baseConfig.agent,
            think: {
                provider: {
                    type: "aws_bedrock",
                    model: "us.anthropic.claude-sonnet-4-20250514-v1:0",
                    credentials: {
                        type: "iam",
                        region: "us-east-2",
                        access_key_id: "<your-access-key-id>",
                        secret_access_key: "<your-secret-access-key>"
                    }
                },
                endpoint: {
                    url: "https://bedrock-runtime.us-east-2.amazonaws.com/"
                },
                prompt: `
Keep your responses short max 1-2 sentenes.

Provide high-level options, then drill into details based on user responses.

Coverage Examples help visualize how the plan works in scenarios like having a baby or managing diabetes, showing what costs are covered and what users pay out-of-pocket.

When discussing options, ask about network providers, prescription coverage, and handling unexpected events. Use the provided Glossary for unfamiliar insurance terms. I'm here to assist, and customer service contacts are available for further questions.

You are an expert in health coverage. Your task is to define and explain health insurance and medical terms clearly. The terms may vary based on the user’s plan.

Do not use formatting in your responses as your responses are being read out loud by a TTS model.

Examples:

Allowed Amount: Max payment the plan will cover for a service.
Appeal: Request to review a denied benefit or payment.
Balance Billing: When billed for the difference between the billed amount and the allowed amount.
Coinsurance: Percentage of costs you pay for a service.
Copayment: Fixed amount you pay at the time of service.
Deductible: Amount you owe before the plan starts paying.
Formulary: List of prescription drugs covered by the plan.
In-network Provider: Contracted providers with lower out-of-pocket costs.
Out-of-pocket Limit: Max you pay during a coverage period.
Assist users in completing a Summary of Benefits and Coverage (SBC) form, ensuring questions are clear and focus on necessary details.

Sections:

Plan Information: Insurance company name, plan option, coverage period, coverage type, and plan type.
Common Medical Events: Services included and costs.
Prescription Drugs: Coverage for drug tiers, copayments, or coinsurance.
Excluded & Other Covered Services: Ask about non-covered and limited services.
Rights and Access: Coverage continuation, grievances, essential coverage, value standards, and language access.
Pricing info:

Deductible: $500 individual/$1,000 family.
Services Before Deductible: Preventive care, primary care.
Out-of-Pocket Limit: $2,500/$5,000 in-network, $4,000/$8,000 out-of-network.
Provider Network: In-network providers cost less.
Specialist Referral: Required.
Example of specific services:

Primary Care Visit: $35 copay, 20% coinsurance, deductible doesn’t apply.
Generic Drugs: $10 copay, 40% coinsurance.
Ensure all sections are completed accurately and prompt users for additional information as needed.
`,
                functions: [
                    {
                        name: "add_meeting_client_side",
                        description: "Add a meeting to the schedule on the client side.",
                        parameters: {                            
                            type: "object",
                            properties: {
                                item: {
                                    type: "string",
                                    description: `
                                        The time and date of the meeting.
                                    `,
                                },
                            },
                            required: ["item"],
                        }
                    },
                    // {
                    //     name: "add_meeting",
                    //     description: "Add a meeting to the schedule.",
                    //     parameters: {                            
                    //         type: "object",
                    //         properties: {
                    //             item: {
                    //                 type: "string",
                    //                 description: `
                    //                     The time and date of the meeting.
                    //                 `,
                    //             },
                    //         },
                    //         required: ["item"],
                    //     },
                    //     endpoint: {
                    //         url: BASE_URL + "/calls/" + callID + "/events/items",
                    //         method: "post"  
                    //     }    
                    // },
                ],
            }
        },
    };
}
