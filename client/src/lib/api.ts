export const startSession = async (formData: FormData) => {
  try {
    const response = await fetch('/api/whatsapp/start', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start WhatsApp session');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error starting WhatsApp session:', error);
    throw new Error(error.message || 'Failed to start WhatsApp session');
  }
};

export const stopSession = async () => {
  try {
    const response = await fetch('/api/whatsapp/stop', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to stop WhatsApp session');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error stopping WhatsApp session:', error);
    throw new Error(error.message || 'Failed to stop WhatsApp session');
  }
};

export const checkStatus = async () => {
  try {
    const response = await fetch('/api/whatsapp/status', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check WhatsApp session status');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error checking WhatsApp session status:', error);
    throw new Error(error.message || 'Failed to check WhatsApp session status');
  }
};
