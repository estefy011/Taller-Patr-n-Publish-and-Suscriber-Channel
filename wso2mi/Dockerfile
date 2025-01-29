# Usar la imagen oficial de WSO2 Micro Integrator como base
FROM wso2/wso2mi:latest

# Crear el directorio para los conectores si no existe
RUN mkdir -p /home/wso2carbon/wso2mi/repository/components/dropins

# Copiar todos los archivos .jar del conector al directorio dropins
COPY connectors/*.jar /home/wso2carbon/wso2mi/repository/components/dropins/
COPY connectors/lib/*.jar /home/wso2carbon/wso2mi/repository/components/dropins/

# Exponer los puertos necesarios
EXPOSE 8290 8253

# Comando para iniciar WSO2 MI
CMD ["/home/wso2carbon/wso2mi/bin/integrator.sh", "start"]
