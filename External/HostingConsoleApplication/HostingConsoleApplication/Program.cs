using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel.Web;
using System.Text;
using System.Threading.Tasks;
using RESTService.Lib;

namespace HostingConsoleApplication
{
    class Program
    {
        static void Main(string[] args)
        {
            var services = new MovieService();
            var serviceHost = new WebServiceHost(services, new Uri("http://localhost:8000/MovieService"));
            serviceHost.Open();
            Console.ReadKey();
            serviceHost.Close();
        }
    }
}
