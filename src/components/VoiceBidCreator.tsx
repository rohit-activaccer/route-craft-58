import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudio";
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
  const chatRef = useRef<RealtimeChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
      chatRef.current = new RealtimeChat(handleMessage, handleSpeakingChange);
      await chatRef.current.init();
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
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
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