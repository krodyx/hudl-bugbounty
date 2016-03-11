using System;

namespace Hudl.BugBounty.WebApp.Models
{
    public class Leader
    {
        public string SquadName { get; set; }
        public string SquadImage { get; set; }
        public int AllTimeScore { get; set; }
        public int WeeklyScore { get; set;}
    }
}
