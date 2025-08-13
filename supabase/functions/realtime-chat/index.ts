import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openaiWs: WebSocket;

  socket.onopen = async () => {
    console.log("Client connected");
    
    // Connect to OpenAI Realtime API
    try {
      openaiWs = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01", {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1"
        }
      });

      openaiWs.onopen = () => {
        console.log("Connected to OpenAI");
        
        // Send session configuration
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: `You are a helpful assistant for creating transportation bids. Your job is to help users create comprehensive bid requests by gathering the following information:

1. Basic Information:
   - Bid name (e.g., "Q1 2024 Regional Lanes")
   - Description of the bid scope
   - Bid type (contract, spot, seasonal, regional)
   - Priority level (low, medium, high, urgent)
   - Budget estimate

2. Timeline:
   - Bid start date
   - Bid end date  
   - Submission deadline

3. Lane Selection:
   - Origin locations
   - Destination locations
   - Expected volumes
   - Distance estimates

4. Requirements:
   - Equipment type (dry van, reefer, flatbed, container)
   - Service level (standard, expedited, white glove)
   - Special handling instructions

Ask questions naturally to gather this information. Be conversational and helpful. Once you have enough information, summarize what you've collected and ask if they want to create the bid.

When ready to create the bid, call the create_bid function with all the collected information.`,
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            tools: [
              {
                type: "function",
                name: "create_bid",
                description: "Create a new transportation bid with the collected information",
                parameters: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Bid name" },
                    description: { type: "string", description: "Bid description" },
                    bid_type: { type: "string", enum: ["contract", "spot", "seasonal", "regional"] },
                    priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                    budget: { type: "number", description: "Budget in currency units" },
                    start_date: { type: "string", description: "ISO date string for bid start" },
                    end_date: { type: "string", description: "ISO date string for bid end" },
                    submission_deadline: { type: "string", description: "ISO datetime string for submission deadline" },
                    equipment_type: { type: "string", description: "Required equipment type" },
                    service_level: { type: "string", description: "Required service level" },
                    special_instructions: { type: "string", description: "Any special handling requirements" }
                  },
                  required: ["name", "bid_type", "start_date", "end_date", "submission_deadline"]
                }
              }
            ],
            tool_choice: "auto",
            temperature: 0.8,
            max_response_output_tokens: 4096
          }
        };
        
        openaiWs.send(JSON.stringify(sessionConfig));
      };

      openaiWs.onmessage = (event) => {
        console.log("OpenAI message:", event.data);
        
        const data = JSON.parse(event.data);
        
        // Handle function calls
        if (data.type === "response.function_call_arguments.done") {
          const functionName = data.name;
          const args = JSON.parse(data.arguments);
          
          if (functionName === "create_bid") {
            // Send bid data to client
            socket.send(JSON.stringify({
              type: "bid_created",
              bid_data: args
            }));
            
            // Send function call result back to OpenAI
            openaiWs.send(JSON.stringify({
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: data.call_id,
                output: JSON.stringify({ success: true, message: "Bid created successfully!" })
              }
            }));
          }
        }
        
        // Forward all messages to client
        socket.send(event.data);
      };

      openaiWs.onerror = (error) => {
        console.error("OpenAI WebSocket error:", error);
        socket.send(JSON.stringify({ type: "error", message: "OpenAI connection error" }));
      };

      openaiWs.onclose = () => {
        console.log("OpenAI connection closed");
        socket.close();
      };

    } catch (error) {
      console.error("Error connecting to OpenAI:", error);
      socket.send(JSON.stringify({ type: "error", message: "Failed to connect to voice service" }));
    }
  };

  socket.onmessage = (event) => {
    console.log("Client message:", event.data);
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    if (openaiWs) {
      openaiWs.close();
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (openaiWs) {
      openaiWs.close();
    }
  };

  return response;
});