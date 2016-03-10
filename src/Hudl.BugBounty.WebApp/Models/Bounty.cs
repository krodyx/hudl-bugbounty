using System;

namespace Hudl.BugBounty.WebApp.Models
{
    public class Bounty
    {
        public string SquadName { get; set; }
        public DateTime? DateCollected { get; set; }
        public double Value { get; set; }
    }
}
