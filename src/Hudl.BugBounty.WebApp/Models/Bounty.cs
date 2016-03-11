using System;

namespace Hudl.BugBounty.WebApp.Models
{
    public class Bounty
    {
        public Hit Hit {get;set;}
        public string HitId {get;set;}
        public string SquadName { get; set; }
        public DateTime? DateCollected { get; set; }
        public double Value { get; set; }
    }
}
