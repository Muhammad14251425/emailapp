import { useState } from "react";
import { Badge } from "@/components/ui/badge"; // Adjust the import based on your project

interface EmailRecipientsProps {
  recipients: string[];
}

const EmailRecipients: React.FC<EmailRecipientsProps> = ({ recipients }) => {
  const [showAll, setShowAll] = useState(false);
  const MAX_DISPLAY = 5;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {recipients.slice(0, showAll ? recipients.length : MAX_DISPLAY).map((recipient, index) => (
        <Badge key={index} variant="secondary">
          {recipient}
        </Badge>
      ))}
      
      {recipients.length > MAX_DISPLAY && !showAll && (
        <Badge
          variant="outline"
          className="cursor-pointer"
          onClick={() => setShowAll(true)}
        >
          +{recipients.length - MAX_DISPLAY} more
        </Badge>
      )}
    </div>
  );
};

export default EmailRecipients;
