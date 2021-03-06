﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hudl.BugBounty.WebApp.Models;

namespace Hudl.BugBounty.WebApp.DataServices
{
    public interface IBountyRepository
    {
        Task<List<Bounty>> GetBounties();
        Task<List<Leader>> GetLeaders();
        Task<List<Hit>> GetHitlist();
        Task<Hit> GetHit(string signature);
        Task<List<Bounty>> GetBountiesFrom(DateTime fromTime);
    }
}
