./pull_db.sh _ChallengeRequirementToMilestone &
./pull_db.sh _ChallengeToComment &
./pull_db.sh _ChallengeToImage &
./pull_db.sh _ChallengeToLike &
./pull_db.sh _CommentToPlannedDayResult &
sleep 3

./pull_db.sh _CommentToUserPost &
./pull_db.sh _DayOfWeekToScheduledHabit &
./pull_db.sh _FeatureToRequesterRole &
./pull_db.sh _FeatureToTargetRole &
./pull_db.sh _IconToIconCategory &
sleep 3

./pull_db.sh _IconToTag &
./pull_db.sh _ImageToPlannedDayResult &
./pull_db.sh _ImageToUserPost &
./pull_db.sh _LikeToPlannedDayResult &
./pull_db.sh _LikeToQuoteOfTheDay &
sleep 3

./pull_db.sh _LikeToUserPost &
./pull_db.sh _RoleToUser &
./pull_db.sh _ScheduledHabitToTimeOfDay &
./pull_db.sh award &
./pull_db.sh badge &
sleep 3

./pull_db.sh blocked_user &
./pull_db.sh challenge &
./pull_db.sh challenge_milestone &
./pull_db.sh challenge_participant &
./pull_db.sh challenge_requirement &
sleep 3

./pull_db.sh comment &
./pull_db.sh day_of_week &
./pull_db.sh feature &
./pull_db.sh habit_category &
./pull_db.sh habit_streak &
sleep 3

./pull_db.sh habit_streak_tier &
./pull_db.sh icon &
./pull_db.sh icon_category &
./pull_db.sh image &
./pull_db.sh level &
sleep 3

./pull_db.sh like &
./pull_db.sh metadata &
./pull_db.sh milestone &
./pull_db.sh notification &
./pull_db.sh planned_day &
sleep 3

./pull_db.sh planned_day_challenge_milestone &
./pull_db.sh planned_day_result &
./pull_db.sh planned_task &
./pull_db.sh point_definition &
./pull_db.sh point_ledger_record &
sleep 3

./pull_db.sh property &
./pull_db.sh quote_of_the_day &
./pull_db.sh role &
./pull_db.sh scheduled_habit &
./pull_db.sh season &
sleep 3

./pull_db.sh tag &
./pull_db.sh task &
./pull_db.sh time_of_day &
./pull_db.sh unit &
./pull_db.sh user &
sleep 3

./pull_db.sh user_award &
./pull_db.sh user_badge &
./pull_db.sh user_post &
./pull_db.sh user_push_notification &
./pull_db.sh widget &
sleep 3
