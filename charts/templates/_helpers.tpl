{{/*
Expand the name of the chart.
*/}}
{{- define "leapmailr-ui.name" -}}
{{- default .Chart.Name .Values.global.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "leapmailr-ui.fullname" -}}
{{- if .Values.global.fullnameOverride -}}
{{- .Values.global.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := include "leapmailr-ui.name" . -}}
{{- printf "%s" $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "leapmailr-ui.labels" -}}
app.kubernetes.io/name: {{ include "leapmailr-ui.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" }}
{{- range $k, $v := (.Values.global.labels | default dict) }}
{{ $k }}: {{ $v | quote }}
{{- end }}
{{- end -}}

{{/*
Workload fullname
*/}}
{{- define "leapmailr-ui.workloadFullname" -}}
{{- $root := index . 0 -}}
{{- $workloadName := index . 1 -}}
{{- printf "%s-%s" (include "leapmailr-ui.fullname" $root) $workloadName | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "leapmailr-ui.selectorLabels" -}}
{{- $root := index . 0 -}}
{{- $workloadName := index . 1 -}}
app.kubernetes.io/name: {{ include "leapmailr-ui.name" $root }}
app.kubernetes.io/instance: {{ $root.Release.Name }}
app.kubernetes.io/component: {{ $workloadName }}
{{- end -}}

{{/*
Resolve imagePullSecrets
*/}}
{{- define "leapmailr-ui.imagePullSecrets" -}}
{{- $secrets := (.Values.global.imagePullSecrets | default list) -}}
{{- if $secrets -}}
imagePullSecrets:
{{- range $secrets }}
  - name: {{ .name | default . | quote }}
{{- end }}
{{- end -}}
{{- end -}}
