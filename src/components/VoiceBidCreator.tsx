import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { BidWorkflowGraph } from "@/components/BidWorkflowGraph";
import Vapi from "@vapi-ai/web";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MessageSquare,
  User,
  Bot,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Message {
  type: string;
  role?: 'user' | 'assistant';
  content?: string;
  message?: string;
  bid_data?: any;
}

interface VoiceBidCreatorProps {
  onBidCreated: (bidData: any) => void;
}

export function VoiceBidCreator({ onBidCreated }: VoiceBidCreatorProps) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isProcessingBid, setIsProcessingBid] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Analyze messages to determine workflow progress
  const analyzeWorkflowProgress = (messages: Message[]) => {
    let step = 0;
    const completed: number[] = [];
    
    const conversationText = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => m.content?.toLowerCase() || '')
      .join(' ');

    // Step 1: Bid Information
    if (conversationText.includes('bid') || conversationText.includes('transportation') || conversationText.includes('proposal')) {
      step = Math.max(step, 1);
      if (conversationText.includes('type') || conversationText.includes('freight') || conversationText.includes('cargo')) {
        completed.push(1);
      }
    }

    // Step 2: Route Details
    if (conversationText.includes('origin') || conversationText.includes('destination') || 
        conversationText.includes('from') || conversationText.includes('to') ||
        conversationText.includes('location') || conversationText.includes('address')) {
      step = Math.max(step, 2);
      if (conversationText.includes('miles') || conversationText.includes('distance') || 
          conversationText.includes('route')) {
        completed.push(2);
      }
    }

    // Step 3: Transportation
    if (conversationText.includes('truck') || conversationText.includes('vehicle') ||
        conversationText.includes('equipment') || conversationText.includes('trailer') ||
        conversationText.includes('capacity')) {
      step = Math.max(step, 3);
      if (conversationText.includes('tons') || conversationText.includes('weight') ||
          conversationText.includes('size')) {
        completed.push(3);
      }
    }

    // Step 4: Timeline
    if (conversationText.includes('deadline') || conversationText.includes('schedule') ||
        conversationText.includes('date') || conversationText.includes('time') ||
        conversationText.includes('delivery')) {
      step = Math.max(step, 4);
      if (conversationText.includes('urgent') || conversationText.includes('asap') ||
          conversationText.includes('flexible')) {
        completed.push(4);
      }
    }

    // Step 5: Budget
    if (conversationText.includes('budget') || conversationText.includes('price') ||
        conversationText.includes('cost') || conversationText.includes('$') ||
        conversationText.includes('dollar')) {
      step = Math.max(step, 5);
      if (conversationText.includes('maximum') || conversationText.includes('limit') ||
          conversationText.includes('range')) {
        completed.push(5);
      }
    }

    // Step 6: Submit
    if (conversationText.includes('submit') || conversationText.includes('publish') ||
        conversationText.includes('create bid') || conversationText.includes('ready')) {
      step = Math.max(step, 6);
    }

    return { step, completed };
  };

  useEffect(() => {
    const { step, completed } = analyzeWorkflowProgress(messages);
    setCurrentStep(step);
    setCompletedSteps(completed);
  }, [messages]);

  const handleMessage = (message: Message) => {
    console.log('Received message:', message);
    
    if (message.type === 'connected') {
      setIsConnected(true);
      setIsConnecting(false);
      setMessages(prev => [...prev, {
        type: 'system',
        content: "Voice interface ready! I'm here to help you create a transportation bid. Tell me about what kind of bid you'd like to create."
      }]);
    } else if (message.type === 'disconnected') {
      setIsConnected(false);
      setMessages(prev => [...prev, {
        type: 'system',
        content: "Voice interface disconnected"
      }]);
    } else if (message.type === 'transcript') {
      if (message.role === 'user') {
        setMessages(prev => [...prev, {
          type: 'transcript',
          role: 'user',
          content: message.content
        }]);
      } else if (message.role === 'assistant') {
        // Update the current assistant transcript
        setTranscript(prev => prev + message.content);
      }
    } else if (message.type === 'bid_created') {
      setMessages(prev => [...prev, {
        type: 'success',
        content: "Great! I've collected all the information needed for your bid. Let me create it for you now."
      }]);
      
      // Handle the bid creation
      onBidCreated(message.bid_data);
      
      toast({
        title: "Bid Created Successfully!",
        description: "Your bid has been created from the voice conversation.",
      });
    } else if (message.type === 'error') {
      setMessages(prev => [...prev, {
        type: 'error',
        content: message.message || 'An error occurred'
      }]);
      
      toast({
        title: "Error",
        description: message.message || 'An error occurred',
        variant: "destructive",
      });
    }
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
    
    // When AI stops speaking, add the complete transcript as a message
    if (!speaking && transcript) {
      setMessages(prev => [...prev, {
        type: 'transcript',
        role: 'assistant',
        content: transcript
      }]);
      setTranscript("");
    }
  };

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      // Initialize Vapi with the provided configuration
      vapiRef.current = new Vapi("0096af4f-e4a8-4b57-a719-d47a30eb3244");
      
      // Set up event listeners
      vapiRef.current.on('call-start', () => {
        console.log('Call started');
        setIsConnected(true);
        setIsConnecting(false);
        setMessages(prev => [...prev, {
          type: 'system',
          content: "Voice interface ready! I'm here to help you create a transportation bid. Tell me about what kind of bid you'd like to create."
        }]);
      });

      vapiRef.current.on('call-end', () => {
        console.log('Call ended');
        setIsConnected(false);
        setIsSpeaking(false);
        setMessages(prev => [...prev, {
          type: 'system',
          content: "Voice interface disconnected"
        }]);
      });

      vapiRef.current.on('speech-start', () => {
        console.log('AI started speaking');
        setIsSpeaking(true);
      });

      vapiRef.current.on('speech-end', () => {
        console.log('AI stopped speaking');
        setIsSpeaking(false);
      });

      vapiRef.current.on('message', (message: any) => {
        console.log('Received message:', message);
        
        if (message.type === 'transcript') {
          if (message.role === 'user') {
            setMessages(prev => [...prev, {
              type: 'transcript',
              role: 'user',
              content: message.transcript
            }]);
          } else if (message.role === 'assistant') {
            setMessages(prev => [...prev, {
              type: 'transcript',
              role: 'assistant',
              content: message.transcript
            }]);
          }
        } else if (message.type === 'function-call' && message.functionCall?.name === 'createBid') {
          const bidData = message.functionCall.parameters;
          setIsProcessingBid(true);
          setMessages(prev => [...prev, {
            type: 'success',
            content: "Great! I've collected all the information needed for your bid. Let me create it for you now."
          }]);
          
          // Simulate processing delay
          setTimeout(() => {
            setIsProcessingBid(false);
            onBidCreated(bidData);
            
            toast({
              title: "Bid Created Successfully!",
              description: "Your bid has been created from the voice conversation.",
            });
          }, 2000);
        }
      });

      vapiRef.current.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setIsConnecting(false);
        setMessages(prev => [...prev, {
          type: 'error',
          content: error.message || 'An error occurred'
        }]);
        
        toast({
          title: "Error",
          description: error.message || 'An error occurred',
          variant: "destructive",
        });
      });

      // Start the call with the assistant
      await vapiRef.current.start("dd2387c7-27fc-463e-a970-ecc977dd7fce");
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsConnecting(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start voice conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    vapiRef.current?.stop();
    setIsConnected(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  const getMessageIcon = (message: Message) => {
    if (message.role === 'user') return <User className="w-4 h-4" />;
    if (message.role === 'assistant') return <Bot className="w-4 h-4" />;
    if (message.type === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (message.type === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <MessageSquare className="w-4 h-4" />;
  };

  const getMessageStyle = (message: Message) => {
    if (message.role === 'user') return "bg-primary/10 border-primary/20 ml-8";
    if (message.role === 'assistant') return "bg-secondary/10 border-secondary/20 mr-8";
    if (message.type === 'success') return "bg-green-50 border-green-200 mx-4";
    if (message.type === 'error') return "bg-red-50 border-red-200 mx-4";
    return "bg-muted/50 border-muted mx-4";
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Bid Creator
          </CardTitle>
          <CardDescription>
            Create your transportation bid by having a conversation with our AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-gray-300'
              }`} />
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Not Connected'}
              </span>
              {isSpeaking && (
                <Badge variant="secondary" className="gap-1">
                  <Volume2 className="w-3 h-3" />
                  AI Speaking
                </Badge>
              )}
            </div>
            
            {!isConnected ? (
              <Button 
                onClick={startConversation}
                disabled={isConnecting}
                className="gap-2"
              >
                <Mic className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Start Voice Chat'}
              </Button>
            ) : (
              <Button 
                onClick={endConversation}
                variant="destructive"
                className="gap-2"
              >
                <MicOff className="w-4 h-4" />
                End Conversation
              </Button>
            )}
          </div>

          {/* Instructions */}
          {!isConnected && !isConnecting && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click "Start Voice Chat" to begin</li>
                <li>• Tell the AI about your transportation bid requirements</li>
                <li>• The AI will ask questions to gather all necessary information</li>
                <li>• Once complete, your bid will be automatically created</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Progress */}
      {(isConnected || messages.length > 0) && (
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Bid Creation Progress
            </CardTitle>
            <CardDescription>
              Track your bid creation journey through each step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BidWorkflowGraph 
              currentStep={currentStep}
              completedSteps={completedSteps}
              isProcessing={isProcessingBid}
            />
          </CardContent>
        </Card>
      )}

      {/* Conversation History */}
      {isConnected && (
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index}>
                    <div className={`p-3 rounded-lg border ${getMessageStyle(message)}`}>
                      <div className="flex items-start gap-2">
                        {getMessageIcon(message)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-1">
                            {message.role === 'user' ? 'You' : 
                             message.role === 'assistant' ? 'AI Assistant' : 
                             message.type === 'success' ? 'Success' :
                             message.type === 'error' ? 'Error' : 'System'}
                          </div>
                          <div className="text-sm text-foreground whitespace-pre-wrap">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < messages.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
                
                {/* Current AI transcript (while speaking) */}
                {isSpeaking && transcript && (
                  <div className="bg-secondary/10 border-secondary/20 mr-8 p-3 rounded-lg border">
                    <div className="flex items-start gap-2">
                      <Bot className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium mb-1 flex items-center gap-2">
                          AI Assistant
                          <Badge variant="secondary" className="gap-1">
                            <Volume2 className="w-3 h-3" />
                            Speaking
                          </Badge>
                        </div>
                        <div className="text-sm text-foreground">
                          {transcript}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}