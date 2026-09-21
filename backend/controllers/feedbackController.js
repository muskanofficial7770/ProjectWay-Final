import Feedback from '../models/Feedback.js';
import StudentIdea from '../models/StudentIdea.js';
import { User } from '../models/User.js';





// Get all feedback (for teacher)
export const getAllFeedback = async (req, res) => {
  console.log('💬 [Feedback] Get all feedback request received');
  console.log('💬 [Feedback] Query params:', req.query);

  try {
    const { groupId, userName } = req.query;
    
    // Only return feedback if groupId is provided
    if (!groupId) {
      return res.status(200).json({ success: true, feedbacks: [] });
    }
    
    const query = { groupId };
    console.log('💬 [Feedback] MongoDB query:', JSON.stringify(query));
    const feedbacks = await Feedback.find(query).sort({ timestamp: -1 });
    
    // Add per-user read status and current idea status to each feedback
    const feedbacksWithReadStatus = await Promise.all(feedbacks.map(async (feedback) => {
      const feedbackObj = feedback.toObject();
      
      // Fetch the current idea status
      try {
        const idea = await StudentIdea.findById(feedback.ideaId);
        feedbackObj.ideaCurrentStatus = idea?.status || feedback.status;
      } catch (error) {
        console.warn('⚠️ [Feedback] Could not fetch idea status for ideaId:', feedback.ideaId, error.message);
        feedbackObj.ideaCurrentStatus = feedback.status;
      }
      
      feedbackObj.isRead = userName ? feedback.readBy.includes(userName) : false;
      return feedbackObj;
    }));
    
    console.log('✅ [Feedback] Retrieved', feedbacks.length, 'feedbacks total');
    res.status(200).json({ success: true, feedbacks: feedbacksWithReadStatus });
  } catch (error) {
    console.error('❌ [Feedback] Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedbacks',
      error: error.message
    });
  }
};







// Mark feedback as read
export const markFeedbackAsRead = async (req, res) => {
  console.log('💬 [Feedback] Mark feedback as read request received');
  console.log('💬 [Feedback] Feedback ID:', req.params.id);
  console.log('💬 [Feedback] User:', req.body.userName);
  
  try {
    const { id } = req.params;
    const { userName } = req.body;
    
    if (!userName) {
      return res.status(400).json({ 
        success: false, 
        message: 'userName is required' 
      });
    }
    
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { 
        $addToSet: { readBy: userName },
        read: true 
      },
      { new: true }
    );

    if (!feedback) {
      console.log('⚠️ [Feedback] Feedback not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    console.log('✅ [Feedback] Feedback marked as read for user:', userName);
    res.status(200).json({ 
      success: true, 
      message: 'Feedback marked as read',
      feedback 
    });
  } catch (error) {
    console.error('❌ [Feedback] Error marking feedback as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking feedback as read', 
      error: error.message 
    });
  }
};

// Migration: Add groupId to existing feedback records
export const migrateFeedbackGroupId = async () => {
  console.log('🔄 [Feedback Migration] Starting migration to add groupId to feedback records...');
  
  try {
    // Find all feedback records without groupId
    const feedbacksWithoutGroupId = await Feedback.find({ 
      $or: [
        { groupId: null },
        { groupId: undefined },
        { groupId: '' }
      ]
    });

    console.log(`📊 [Feedback Migration] Found ${feedbacksWithoutGroupId.length} feedback records without groupId`);

    if (feedbacksWithoutGroupId.length === 0) {
      console.log('✅ [Feedback Migration] No feedback records need migration');
      return { success: true, message: 'No migration needed', updated: 0 };
    }

    let updatedCount = 0;
    let failedCount = 0;

    // Process each feedback record
    for (const feedbackRecord of feedbacksWithoutGroupId) {
      try {
        // Find the leader's groupId
        const leader = await User.findOne({ name: feedbackRecord.leaderName });
        
        if (leader && leader.groupId) {
          // Update the feedback record with groupId
          await Feedback.findByIdAndUpdate(
            feedbackRecord._id,
            { groupId: leader.groupId },
            { new: true }
          );
          updatedCount++;
          console.log(`✅ [Feedback Migration] Updated feedback for leader: ${feedbackRecord.leaderName}, groupId: ${leader.groupId}`);
        } else {
          failedCount++;
          console.warn(`⚠️ [Feedback Migration] Leader not found or has no groupId: ${feedbackRecord.leaderName}`);
        }
      } catch (error) {
        failedCount++;
        console.error(`❌ [Feedback Migration] Error migrating feedback record:`, error.message);
      }
    }

    console.log(`🎉 [Feedback Migration] Migration complete. Updated: ${updatedCount}, Failed: ${failedCount}`);
    return { 
      success: true, 
      message: 'Migration completed',
      updated: updatedCount,
      failed: failedCount
    };
  } catch (error) {
    console.error('❌ [Feedback Migration] Migration failed:', error);
    return { 
      success: false, 
      message: 'Migration failed',
      error: error.message
    };
  }
};

