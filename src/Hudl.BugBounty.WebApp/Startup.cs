using System;
using Hudl.BugBounty.WebApp.DataServices;
using Hudl.BugBounty.WebApp.Options;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.OptionsModel;
using Microsoft.Extensions.PlatformAbstractions;

namespace Hudl.BugBounty.WebApp
{
    public class Startup
    {
        public IConfiguration Configuration { get; set; }

        public Startup(IHostingEnvironment env, IApplicationEnvironment appEnv)
        {
            Configuration = new ConfigurationBuilder()
                .AddJsonFile("config.json")
                .AddJsonFile($"config.{env.EnvironmentName}.json", optional: true)
                // The values in here override the values in config.json if they exist
                .AddEnvironmentVariables("DatabaseSettings:")
                // Get additional database settings from environment variables e.g. Username and Password since we don't want these in config.
                .AddEnvironmentVariables("LoggerSettings:") // In case we want to override the level on the fly
                .Build();
        }


        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddOptions(); //Enable configuration options
            services.Configure<DatabaseSettings>(Configuration.GetSection("DatabaseSettings"));
            // Get the DatabaseSettings from configuration
            services.Configure<LoggerSettings>(Configuration.GetSection("LoggerSettings"));

            services.AddMvc();

            services.AddSingleton<IBountyRepository, MongoBountyRepository>();
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, ILoggerFactory loggerFactory,
            IOptions<LoggerSettings> loggerSettings)
        {
            var configuredLogLevel = loggerSettings.Value != null ? loggerSettings.Value.Level : "Information";
            LogLevel level;
            if (!Enum.TryParse(configuredLogLevel, out level)) level = LogLevel.Information;
            loggerFactory.AddConsole(minLevel: level);

            app.UseMvcWithDefaultRoute();
            app.UseStaticFiles();
        }

        // Entry point for the application.
        public static void Main(string[] args)
        {
            WebApplication.Run<Startup>(args);
        }
    }
}
