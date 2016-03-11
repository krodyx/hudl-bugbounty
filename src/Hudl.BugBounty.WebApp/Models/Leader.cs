namespace Hudl.BugBounty.WebApp.Models
{
    public sealed class Leader
    {
        public string SquadName { get; set; }
        public string SquadImage { get; set; }
        public double AllTimeScore { get; set; }
        public double TimeWindowScore { get; set; }
    }
}
