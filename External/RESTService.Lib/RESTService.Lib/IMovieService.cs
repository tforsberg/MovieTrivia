using System.ServiceModel;

namespace RESTService.Lib
{
    [ServiceContract]
    public interface IMovieService
    {
        [OperationContract]
        string GetData();
    }

}
