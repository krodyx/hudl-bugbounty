using System;

namespace Hudl.BugBounty.WebApp.Models
{
    public class Hit
    {
        public string key { get { return Signature; } }
        public string Signature { get; set; }
        public string Service { get; set; }
        public string Description { get; set; }
        public string Stacktrace { get; set; }
        public DateTime? FirstOccurance { get; set; }
        public double CurrentValue { get; set; }
    }
}
